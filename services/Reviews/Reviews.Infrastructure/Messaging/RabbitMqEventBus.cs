using RabbitMQ.Client;
using Reviews.Application.Messaging;
using System.Text.Json;

namespace Reviews.Infrastructure.Messaging;

public sealed class RabbitMqEventBus : IEventBus, IAsyncDisposable
{
    private readonly IConnection _conn;
    private readonly IChannel _ch;

    public RabbitMqEventBus()
    {
        var host = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        var port = int.Parse(Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672");
        var user = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
        var pass = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest";

        var factory = new ConnectionFactory
        {
            HostName = host,
            Port = port,
            UserName = user,
            Password = pass
        };

        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();
    }

    public async Task PublishAsync<T>(T @event, string queueName, CancellationToken ct)
    {
        var body = JsonSerializer.SerializeToUtf8Bytes(@event);

        await _ch.ExchangeDeclareAsync(queueName, ExchangeType.Fanout, durable: true);
        await _ch.BasicPublishAsync(exchange: queueName, routingKey: string.Empty, body: body, cancellationToken: ct);
    }

    public async ValueTask DisposeAsync()
    {
        await _ch.CloseAsync();
        await _conn.CloseAsync();
    }
}
