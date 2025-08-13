using Catalog.Application.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

namespace Catalog.Infrastructure.Messaging.Consumer;

public sealed class CatalogRpcConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public CatalogRpcConsumer(IServiceProvider serviceProvider)
    {
        this._serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        Console.WriteLine("[CATALOG] → Iniciando listener RPC...");

        var host = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        var port = int.Parse(Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672");
        var user = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
        var pass = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest";

        Console.WriteLine($"[CATALOG] → RabbitMQ en {host}:{port} con usuario '{user}'");

        var factory = new ConnectionFactory
        {
            HostName = host,
            Port = port,
            UserName = user,
            Password = pass
        };

        await using var conn = await factory.CreateConnectionAsync(ct);
        Console.WriteLine("[CATALOG] ✓ Conexión establecida");

        await using var channel = await conn.CreateChannelAsync(null, ct);
        Console.WriteLine("[CATALOG] ✓ Canal creado");

        await channel.ExchangeDeclareAsync("catalog.exchange", ExchangeType.Topic, durable: true, cancellationToken: ct);
        await channel.QueueDeclareAsync("catalog.get.showtime.queue", durable: true, exclusive: false, autoDelete: false, cancellationToken: ct);
        await channel.QueueBindAsync("catalog.get.showtime.queue", "catalog.exchange", "catalog.get.showtime", cancellationToken: ct);

        Console.WriteLine("[CATALOG] ✓ Cola y exchange declarados. Esperando mensajes...");

        var getShowtimeConsumer = new AsyncEventingBasicConsumer(channel);
        getShowtimeConsumer.ReceivedAsync += async (_, ea) =>
        {
            Console.WriteLine("[CATALOG] → Solicitud de datos de showtime recibida");

            var props = ea.BasicProperties;
            var replyProps = new BasicProperties { CorrelationId = props.CorrelationId };

            try
            {
                var request = JsonSerializer.Deserialize<GetShowtimeRequest>(ea.Body.Span);
                Console.WriteLine($"[CATALOG] → Buscando showtime ID: {request.ShowtimeId}");

                using var scope = this._serviceProvider.CreateScope();
                var showtimeService = scope.ServiceProvider.GetRequiredService<IShowtimeService>();
                
                var showtime = await showtimeService.GetByIdAsync(request.ShowtimeId, ct);
                
                GetShowtimeResponse response;
                if (showtime != null)
                {
                    response = new GetShowtimeResponse(
                        showtime.Id, 
                        $"Película ID {showtime.MovieId}", // Usar MovieId como título temporal
                        showtime.StartTime, 
                        showtime.Room
                    );
                    Console.WriteLine($"[CATALOG] ✓ Showtime encontrado: {response.MovieTitle}");
                }
                else
                {
                    response = new GetShowtimeResponse(request.ShowtimeId, "Película Desconocida", DateTime.MinValue, "Sala Desconocida");
                    Console.WriteLine($"[CATALOG] ⚠ Showtime no encontrado para ID: {request.ShowtimeId}");
                }

                var responseBytes = JsonSerializer.SerializeToUtf8Bytes(response);

                await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: props.ReplyTo,
                    mandatory: false,
                    basicProperties: replyProps,
                    body: responseBytes,
                    cancellationToken: ct);

                await channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: ct);
                Console.WriteLine("[CATALOG] ← Respuesta de showtime enviada");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CATALOG] ✖ Error obteniendo showtime: {ex.Message}");
                
                var errorResponse = new GetShowtimeResponse(0, "Error", DateTime.MinValue, "Error");
                var errorBytes = JsonSerializer.SerializeToUtf8Bytes(errorResponse);

                await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: props.ReplyTo,
                    mandatory: false,
                    basicProperties: replyProps,
                    body: errorBytes,
                    cancellationToken: ct);

                await channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: ct);
            }
        };

        await channel.BasicConsumeAsync(
            queue: "catalog.get.showtime.queue",
            autoAck: false,
            consumer: getShowtimeConsumer,
            cancellationToken: ct);

        await Task.Delay(Timeout.Infinite, ct);
    }
}

public record GetShowtimeRequest(int ShowtimeId);
public record GetShowtimeResponse(int Id, string MovieTitle, DateTime StartTime, string Room);
