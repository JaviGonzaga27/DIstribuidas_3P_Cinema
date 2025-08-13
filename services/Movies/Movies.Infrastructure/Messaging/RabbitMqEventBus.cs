using DotNetEnv;
using Movies.Application.Interface;
using RabbitMQ.Client;
using System.Text.Json;


namespace Movies.Infrastructure.Messaging
{
    public sealed class RabbitMqEventBus : IEventBus, IAsyncDisposable
    {
        public const string MOVIES_EXCHANGE = "movies.exchange";
        private const string USER_EXCHANGE = "user.exchange";

        private readonly IConnection _conn;
        private readonly IChannel _ch;

        public RabbitMqEventBus()
        {
            Env.Load();

            var factory = new ConnectionFactory
            {
                HostName = Require("RABBITMQ_HOST"),
                Port = int.Parse(Require("RABBITMQ_PORT")),
                UserName = Require("RABBITMQ_USER"),
                Password = Require("RABBITMQ_PASS")
            };

            _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
            _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();

            _ch.ExchangeDeclareAsync(USER_EXCHANGE, ExchangeType.Fanout, durable: true).GetAwaiter().GetResult();
            _ch.ExchangeDeclareAsync(MOVIES_EXCHANGE, ExchangeType.Fanout, durable: true).GetAwaiter().GetResult();
        }

        public async Task PublishAsync<T>(T @event, CancellationToken ct = default)
        {
            var body = JsonSerializer.SerializeToUtf8Bytes(@event);
            await _ch.BasicPublishAsync(USER_EXCHANGE, routingKey: string.Empty, body: body, cancellationToken: ct);
        }

        public Task PublishAsync<T>(T @event, string exchange, CancellationToken ct = default)
        {
            var body = JsonSerializer.SerializeToUtf8Bytes(@event);
            return _ch.BasicPublishAsync(exchange,
                                         routingKey: string.Empty,
                                         body: body,
                                         cancellationToken: ct).AsTask();
        }


        public async ValueTask DisposeAsync()
        {
            await _ch.CloseAsync();
            await _conn.CloseAsync();
        }

        private static string Require(string key)
        {
            var v = Environment.GetEnvironmentVariable(key);
            if (string.IsNullOrWhiteSpace(v)) throw new InvalidOperationException($"Missing env {key}");
            return v;
        }
    }
}