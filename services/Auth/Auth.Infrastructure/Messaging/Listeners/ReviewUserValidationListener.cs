using Auth.Application.Contracts;
using Messaging.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

public sealed class ReviewUserValidationListener : BackgroundService
{
    private readonly IConnectionFactory _factory;
    private readonly IServiceProvider _serviceProvider;

    public ReviewUserValidationListener(IConnectionFactory factory, IServiceProvider serviceProvider)
        => (_factory, _serviceProvider) = (factory, serviceProvider);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var conn = await _factory.CreateConnectionAsync(ct);
        var ch = await conn.CreateChannelAsync(null, ct);

        await ch.ExchangeDeclareAsync("review-ex", ExchangeType.Topic, durable: true, cancellationToken: ct);
        var q = await ch.QueueDeclareAsync(string.Empty, exclusive: true);
        await ch.QueueBindAsync(q.QueueName, "review-ex", "review.create.requested");

        Console.WriteLine("[USER_VALIDATOR] 🟢 Escuchando eventos review.create.requested...");

        var consumer = new AsyncEventingBasicConsumer(ch);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            var evt = JsonSerializer.Deserialize<ReviewCreateRequested>(ea.Body.Span);
            if (evt is null)
            {
                Console.WriteLine("[USER_VALIDATOR] ⚠️ Evento malformado o nulo.");
                await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
                return;
            }

            Console.WriteLine($"[USER_VALIDATOR] 📩 Recibido evento para UserId={evt.UserId}");

            using var scope = _serviceProvider.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IUsersRepository>();

            bool exists = await repo.ExistsAsync(evt.UserId, ct);
            Console.WriteLine($"[USER_VALIDATOR] 👤 UserId={evt.UserId} exists={exists}");

            var response = new ReviewUserValidated(evt.UserId, exists);

            await ch.BasicPublishAsync(
                exchange: "review-ex",
                routingKey: "review.user.validated",
                body: JsonSerializer.SerializeToUtf8Bytes(response),
                cancellationToken: ct
            );

            Console.WriteLine($"[USER_VALIDATOR] 📤 Publicado review.user.validated para UserId={evt.UserId}");

            await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
        };

        await ch.BasicConsumeAsync(q.QueueName, autoAck: false, consumer, cancellationToken: ct);
        await Task.Delay(Timeout.Infinite, ct);
    }
}
