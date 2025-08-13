using Messaging.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

public sealed class ReviewMovieValidationListener : BackgroundService
{
    private readonly IConnectionFactory _factory;
    private readonly IServiceProvider _serviceProvider;

    public ReviewMovieValidationListener(IConnectionFactory factory, IServiceProvider serviceProvider)
        => (_factory, _serviceProvider) = (factory, serviceProvider);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var conn = await _factory.CreateConnectionAsync(ct);
        var ch = await conn.CreateChannelAsync(null, ct);

        await ch.ExchangeDeclareAsync("review-ex", ExchangeType.Topic, durable: true, cancellationToken: ct);
        var q = await ch.QueueDeclareAsync(string.Empty, exclusive: true);
        await ch.QueueBindAsync(q.QueueName, "review-ex", "review.create.requested");

        Console.WriteLine("[MOVIE_VALIDATOR] 🟢 Escuchando eventos review.create.requested...");

        var consumer = new AsyncEventingBasicConsumer(ch);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            var evt = JsonSerializer.Deserialize<ReviewCreateRequested>(ea.Body.Span);
            if (evt is null)
            {
                Console.WriteLine("[MOVIE_VALIDATOR] ⚠️ Evento inválido o malformado.");
                await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
                return;
            }

            Console.WriteLine($"[MOVIE_VALIDATOR] 📩 Recibido evento para MovieId={evt.MovieId}");

            using var scope = _serviceProvider.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<Movies.Application.Interface.IMovieRepository>();

            bool exists = await repo.ExistsAsync(evt.MovieId, ct);
            Console.WriteLine($"[MOVIE_VALIDATOR] 🎬 MovieId={evt.MovieId} exists={exists}");

            var response = new ReviewMovieValidated(evt.MovieId, exists);

            await ch.BasicPublishAsync(
                exchange: "review-ex",
                routingKey: "review.movie.validated",
                body: JsonSerializer.SerializeToUtf8Bytes(response),
                cancellationToken: ct
            );

            Console.WriteLine($"[MOVIE_VALIDATOR] 📤 Publicado review.movie.validated para MovieId={evt.MovieId}");

            await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
        };

        await ch.BasicConsumeAsync(q.QueueName, autoAck: false, consumer, cancellationToken: ct);
        await Task.Delay(Timeout.Infinite, ct);
    }
}
