using Catalog.Application.DTOs;
using Catalog.Application.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

namespace Catalog.Infrastructure.Messaging.Listeners;

public sealed class MovieCreatedListener : BackgroundService
{
    private readonly IConnectionFactory _factory;
    private readonly IServiceProvider _serviceProvider;

    public MovieCreatedListener(IConnectionFactory factory, IServiceProvider serviceProvider)
    {
        _factory = factory;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var conn = await _factory.CreateConnectionAsync(ct);
        var ch = await conn.CreateChannelAsync(null, ct);

        await ch.ExchangeDeclareAsync("movies.exchange", ExchangeType.Fanout, durable: true, cancellationToken: ct);
        await ch.QueueDeclareAsync("catalog.movie-created", durable: true, exclusive: false, autoDelete: false, cancellationToken: ct);
        await ch.QueueBindAsync("catalog.movie-created", "movies.exchange", routingKey: string.Empty, cancellationToken: ct);

        Console.WriteLine("[CATALOG] Escuchando eventos MovieCreated...");

        var consumer = new AsyncEventingBasicConsumer(ch);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            try
            {
                var json = System.Text.Encoding.UTF8.GetString(ea.Body.ToArray());
                Console.WriteLine("[CATALOG] JSON recibido:");
                Console.WriteLine(json);

                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("Movie", out var movieElement))
                {
                    Console.WriteLine("[CATALOG] ❌ No se encontró la propiedad 'Movie' en el evento.");
                    await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
                    return;
                }

                if (!movieElement.TryGetProperty("Id", out var idElement))
                {
                    await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
                    return;
                }

                var movieId = idElement.GetInt32();

                if (!doc.RootElement.TryGetProperty("Showtimes", out var showtimesElement))
                {
                    Console.WriteLine("[CATALOG] ❌ No se encontró la propiedad 'Showtimes'.");
                    await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
                    return;
                }

                var showtimes = JsonSerializer.Deserialize<List<ShowtimeDto>>(showtimesElement.GetRawText());

                if (showtimes is null || showtimes.Count == 0)
                {
                    Console.WriteLine("[CATALOG] ⚠ Evento recibido sin showtimes.");
                    await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
                    return;
                }

                Console.WriteLine($"[CATALOG] Evento válido para MovieId={movieId} con {showtimes.Count} showtimes.");

                using var scope = _serviceProvider.CreateScope();
                var svc = scope.ServiceProvider.GetRequiredService<IShowtimeService>();

                await svc.CreateMultipleAsync(movieId, showtimes, ct);

                await ch.BasicAckAsync(ea.DeliveryTag, multiple: false, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CATALOG] ❌ Error procesando evento: {ex.Message}");
                await ch.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true, cancellationToken: ct);
            }
        };


        await ch.BasicConsumeAsync("catalog.movie-created", autoAck: false, consumer, cancellationToken: ct);
        await Task.Delay(Timeout.Infinite, ct);
    }
}
