using DotNetEnv;
using Movies.Application.Interface;
using RabbitMQ.Client;
using System.Text.Json;

namespace Catalog.Infrastructure.Messaging;

public sealed class RabbitMqEventBus : IEventBus, IAsyncDisposable
{
    private readonly IConnection _conn;
    private readonly IChannel _ch;

    public RabbitMqEventBus()
    {
        // Cargar archivo .env
        Env.Load();

        // Obtener y validar variables obligatorias
        string host = RequireEnv("RABBITMQ_HOST");
        int port = int.Parse(RequireEnv("RABBITMQ_PORT"));
        string user = RequireEnv("RABBITMQ_USER");
        string pass = RequireEnv("RABBITMQ_PASS");

        // Crear conexión
        var factory = new ConnectionFactory
        {
            HostName = host,
            Port = port,
            UserName = user,
            Password = pass
        };

        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();

        _ch.ExchangeDeclareAsync("user.exchange",
                                 ExchangeType.Fanout,
                                 durable: true).GetAwaiter().GetResult();
    }

    public async Task PublishAsync<T>(T @event, CancellationToken ct = default)
    {
        var body = JsonSerializer.SerializeToUtf8Bytes(@event);
        await _ch.BasicPublishAsync("user.exchange",
                                    routingKey: string.Empty,
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
        Console.WriteLine("Working dir: " + Directory.GetCurrentDirectory());

        var value = Environment.GetEnvironmentVariable(key);
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"La variable de entorno '{key}' es requerida pero no está definida.");
        return value;
    }
}
