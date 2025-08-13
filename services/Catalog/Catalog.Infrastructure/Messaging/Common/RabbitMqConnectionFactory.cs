using RabbitMQ.Client;

namespace Catalog.Infrastructure.Messaging.Common
{
    public static class RabbitMqConnectionFactory
    {
        public static async Task<IConnection> CreateConnectionAsync(CancellationToken ct = default)
        {
            DotNetEnv.Env.Load();

            var factory = new ConnectionFactory
            {
                HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost",
                Port = int.Parse(Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672"),
                UserName = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest",
                Password = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest",
                AutomaticRecoveryEnabled = true
            };

            return await factory.CreateConnectionAsync(ct);
        }

        public static async Task<IChannel> CreateChannelAsync(IConnection connection, CancellationToken ct = default)
        {
            return await connection.CreateChannelAsync(cancellationToken: ct);
        }
    }
}
