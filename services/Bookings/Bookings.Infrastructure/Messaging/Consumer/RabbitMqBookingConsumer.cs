using Bookings.Application.DTOs;
using Bookings.Application.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace Bookings.Infrastructure.Messaging.Consumer;

public sealed class RabbitMqBookingConsumer : BackgroundService, IAsyncDisposable
{
    private readonly IConnection _conn;
    private readonly IChannel _ch;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RabbitMqBookingConsumer> _logger;

    public RabbitMqBookingConsumer(IServiceScopeFactory scopeFactory,
                                   ILogger<RabbitMqBookingConsumer> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var host = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        var port = int.Parse(Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672");
        var user = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
        var pass = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest";

        var factory = new ConnectionFactory
        {
            HostName = host,
            Port = port,
            UserName = user,
            Password = pass,
            AutomaticRecoveryEnabled = true
        };

        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _ch = _conn.CreateChannelAsync().GetAwaiter().GetResult();

        _ch.ExchangeDeclareAsync("cinema.exchange", ExchangeType.Topic, durable: true)
            .GetAwaiter().GetResult();

        _ch.QueueDeclareAsync("bookings.events", durable: true, exclusive: false, autoDelete: false)
            .GetAwaiter().GetResult();

        _ch.QueueBindAsync("bookings.events", "cinema.exchange", "catalog.seats.*")
            .GetAwaiter().GetResult();
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumer = new AsyncEventingBasicConsumer(_ch);
        consumer.ReceivedAsync += HandleMessageAsync;

        _ch.BasicConsumeAsync("bookings.events", autoAck: false, consumer,
                              cancellationToken: stoppingToken);

        return Task.CompletedTask;
    }

    private async Task HandleMessageAsync(object? sender, BasicDeliverEventArgs ea)
    {
        var json = Encoding.UTF8.GetString(ea.Body.ToArray());

        Console.WriteLine($"[RabbitMqBookingConsumer] {DateTime.Now:HH:mm:ss} {ea.RoutingKey}: {json}");

        _logger.LogInformation("Received {RoutingKey}: {Payload}", ea.RoutingKey, json);

        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var repo = scope.ServiceProvider.GetRequiredService<IBookingRepository>();

            if (ea.RoutingKey == "catalog.seats.reserved")
            {
                var evt = JsonSerializer.Deserialize<SeatsReservedEvent>(json);
                if (evt is not null)
                {
                    var booking = await repo.GetByIdAsync(evt.BookingId, CancellationToken.None);
                    if (booking is not null)
                    {
                        booking.Status = "Confirmed";
                        await repo.UpdateAsync(booking, CancellationToken.None);
                    }
                }
            }
            else if (ea.RoutingKey == "catalog.seats.failed")
            {
                var evt = JsonSerializer.Deserialize<SeatsReservationFailedEvent>(json);
                if (evt is not null)
                {
                    await repo.CancelAsync(evt.BookingId, CancellationToken.None);
                }
            }

            await _ch.BasicAckAsync(ea.DeliveryTag, multiple: false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            await _ch.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await _ch.CloseAsync();
        await _conn.CloseAsync();
    }
}
