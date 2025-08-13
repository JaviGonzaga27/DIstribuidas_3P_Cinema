using Auth.Application.Interface;
using Auth.Application.Interfaces;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

namespace Auth.Infrastructure.Messaging;

public sealed class RabbitRpcClient : IRpcClient, IAsyncDisposable
{
    private readonly IConnection _conn;
    private readonly IChannel _ch;

    public RabbitRpcClient()
    {
        var host = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        var port = int.Parse(Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672");
        var user = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
        var pass = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest";

        Console.WriteLine($"[RPC] → Conectando a RabbitMQ en {host}:{port} con usuario '{user}'");

        var factory = new ConnectionFactory
        {
            HostName = host,
            Port = port,
            UserName = user,
            Password = pass,
            AutomaticRecoveryEnabled = true        };

        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        Console.WriteLine("[RPC] ✓ Conexión establecida");

        _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();
        Console.WriteLine("[RPC] ✓ Canal creado");
    }

    public async Task<TReply> RequestAsync<TReq, TReply>(
        string exchange,
        string routingKey,
        TReq message,
        TimeSpan timeout,
        CancellationToken ct = default)
    {

        await _ch.ExchangeDeclareAsync(
            exchange: exchange,
            type: ExchangeType.Topic,
            durable: true,
            cancellationToken: ct);
        Console.WriteLine($"[RPC] ✓ Exchange '{exchange}' declarado");

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

        Console.WriteLine($"[RPC] → Publicando RPC '{routingKey}' CorrId={corrId}");
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
                Console.WriteLine($"[RPC] ✓ Respuesta recibida CorrId={corrId}");
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
            tcs.TrySetException(new TimeoutException("RPC timeout")));

        return await tcs.Task;
    }

    public async ValueTask DisposeAsync()
    {
        await _ch.CloseAsync();
        await _conn.CloseAsync();
    }
}
