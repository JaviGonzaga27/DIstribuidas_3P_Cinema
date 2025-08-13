using Bookings.Application.Interface;
using DotNetEnv;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

namespace Bookings.Infrastructure.Messaging
{
    public sealed class RabbitRpcClient : IRabbitRpcClient
    {
        private readonly IConnection _conn;
        private readonly IChannel _ch;

        public RabbitRpcClient()
        {
            Env.Load();

            var factory = new ConnectionFactory
            {
                HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost",
                Port = int.Parse(Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672"),
                UserName = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest",
                Password = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest",
                AutomaticRecoveryEnabled = true,
            };

            _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
            _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();
        }

        public async Task<TReply> RequestAsync<TReq, TReply>(
            string exchange,
            string routingKey,
            TReq message,
            TimeSpan timeout,
            CancellationToken ct = default)
        {
            var replyQueue = await _ch.QueueDeclareAsync(
                queue: "",
                durable: false,
                exclusive: true,
                autoDelete: true,
                arguments: null,
                cancellationToken: ct);
            var corrId = Guid.NewGuid().ToString("N");

            var props = new BasicProperties
            {
                CorrelationId = corrId,
                ReplyTo = replyQueue.QueueName
            };

            var body = JsonSerializer.SerializeToUtf8Bytes(message);

            await _ch.BasicPublishAsync(
                exchange: exchange,
                routingKey: routingKey,
                mandatory: false,
                basicProperties: props,
                body: body,
                cancellationToken: ct);

            var tcs = new TaskCompletionSource<TReply>(TaskCreationOptions.RunContinuationsAsynchronously);

            var consumer = new AsyncEventingBasicConsumer(_ch);
            consumer.ReceivedAsync += async (_, ea) =>
            {
                if (ea.BasicProperties?.CorrelationId == corrId)
                {
                    var resp = JsonSerializer.Deserialize<TReply>(ea.Body.Span)!;
                    tcs.TrySetResult(resp);
                    await _ch.BasicAckAsync(ea.DeliveryTag, false);
                }
                else
                {
                    await _ch.BasicNackAsync(ea.DeliveryTag, false, requeue: true);
                }
            };

            await _ch.BasicConsumeAsync(
                queue: replyQueue.QueueName,
                autoAck: false,
                consumer: consumer,
                cancellationToken: ct);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(timeout);
            await using var _ = cts.Token.Register(() =>
                tcs.TrySetException(new TimeoutException("Tiempo de espera excedido al reservar asientos")));

            return await tcs.Task;
        }

        public async ValueTask DisposeAsync()
        {
            await _ch.CloseAsync();
            await _conn.CloseAsync();
        }
    }
}
