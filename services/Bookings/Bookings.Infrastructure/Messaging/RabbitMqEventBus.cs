using DotNetEnv;
using Movies.Application.Interface;
using RabbitMQ.Client;
using System.Text.Json;

namespace Bookings.Infrastructure.Messaging;

public sealed class RabbitMqEventBus : IEventBus, IAsyncDisposable
{
    private readonly IConnection _conn;
    private readonly IChannel _ch;
    private readonly string _exchange;

    public RabbitMqEventBus()
    {
        Env.Load();

        string host = RequireEnv("RABBITMQ_HOST");
        int port = int.Parse(RequireEnv("RABBITMQ_PORT"));
        string user = RequireEnv("RABBITMQ_USER");
        string pass = RequireEnv("RABBITMQ_PASS");
        _exchange = Environment.GetEnvironmentVariable("RABBITMQ_EXCHANGE") ?? "cinema.exchange";

        var factory = new ConnectionFactory
        {
            HostName = host,
            Port = port,
            UserName = user,
            Password = pass,
            AutomaticRecoveryEnabled = true,
        };

        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();

        _ch.ExchangeDeclareAsync(_exchange,
                                 ExchangeType.Topic,
                                 durable: true)
            .GetAwaiter().GetResult();
    }

    public async Task PublishAsync<T>(string routingKey, T message, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(routingKey))
            throw new ArgumentException("routingKey no puede ser vacío", nameof(routingKey));

        var body = JsonSerializer.SerializeToUtf8Bytes(message);

        await _ch.BasicPublishAsync(
            _exchange,
            routingKey,
            body: body,
            cancellationToken: ct);
    }

    public async ValueTask DisposeAsync()
    {
        await _ch.CloseAsync();
        await _conn.CloseAsync();
    }

    private static string RequireEnv(string key)
    {
        var value = Environment.GetEnvironmentVariable(key);
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"La variable de entorno '{key}' es requerida pero no está definida.");
        return value;
    }
}
