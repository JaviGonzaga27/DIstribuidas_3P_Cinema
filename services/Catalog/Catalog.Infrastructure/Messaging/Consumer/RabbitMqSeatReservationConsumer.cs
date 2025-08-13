using Catalog.Application.DTOs;
using Catalog.Application.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System;
using Catalog.Infrastructure.Messaging.Common;

namespace Catalog.Infrastructure.Messaging.Consumer; 

public sealed class RabbitMqSeatReservationConsumer : BackgroundService, IAsyncDisposable
{
    private IConnection? _conn;
    private IChannel? _ch;
    private readonly IServiceScopeFactory _scopeFactory;
    private const string Exchange = "cinema.exchange";
    private const string QueueName = "catalog.rpc.reserve.seats";
    private const string RoutingKey = "catalog.reserve.seats";

    public RabbitMqSeatReservationConsumer(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        Console.WriteLine("[Consumer] Iniciando conexión a RabbitMQ...");

        _conn = await RabbitMqConnectionFactory.CreateConnectionAsync(ct);
        _ch = await RabbitMqConnectionFactory.CreateChannelAsync(_conn, ct);

        Console.WriteLine("[Consumer] Conexión y canal creados.");

        await _ch.ExchangeDeclareAsync(Exchange, ExchangeType.Topic, durable: true, cancellationToken: ct);
        await _ch.QueueDeclareAsync(QueueName, durable: false, exclusive: false, autoDelete: false, cancellationToken: ct);
        await _ch.QueueBindAsync(QueueName, Exchange, RoutingKey, cancellationToken: ct);

        Console.WriteLine($"[Consumer] Cola '{QueueName}' declarada y vinculada a exchange '{Exchange}' con routingKey '{RoutingKey}'.");

        var consumer = new AsyncEventingBasicConsumer(_ch);
        consumer.ReceivedAsync += OnMessageAsync;

        await _ch.BasicConsumeAsync(QueueName, autoAck: false, consumer, cancellationToken: ct);

        Console.WriteLine("[Consumer] Esperando mensajes...");
    }

    private async Task OnMessageAsync(object sender, BasicDeliverEventArgs ea)
    {
        try
        {
            Console.WriteLine("[Consumer] Mensaje recibido. Procesando...");

            var cmd = JsonSerializer.Deserialize<ReserveSeatsCommand>(ea.Body.Span);
            if (cmd == null)
            {
                Console.WriteLine("[Consumer] Comando inválido. Ignorando mensaje.");
                await _ch!.BasicAckAsync(ea.DeliveryTag, false);
                return;
            }

            Console.WriteLine($"[Consumer] Reservando {cmd.Quantity} asientos para ShowtimeId {cmd.ShowtimeId}...");

            await using var scope = _scopeFactory.CreateAsyncScope();
            var repo = scope.ServiceProvider.GetRequiredService<IShowtimeRepository>();

            bool ok = await repo.TryReserveSeatsAsync(cmd.ShowtimeId, cmd.Quantity);
            
            // Obtener asientos disponibles después de la operación
            int availableSeats = ok ? await repo.GetAvailableSeatsAsync(cmd.ShowtimeId, CancellationToken.None) : 0;

            var response = new ReserveSeatsResponse(ok, ok ? null : "No hay asientos suficientes", availableSeats);
            var respBytes = JsonSerializer.SerializeToUtf8Bytes(response);

            var props = new BasicProperties
            {
                CorrelationId = ea.BasicProperties.CorrelationId
            };

            await _ch!.BasicPublishAsync(
                exchange: "",
                routingKey: ea.BasicProperties.ReplyTo ?? "",
                mandatory: false,
                basicProperties: props,
                body: respBytes);

            Console.WriteLine($"[Consumer] Respuesta enviada. Resultado: {(ok ? "Éxito" : "Fallo")}");

            await _ch.BasicAckAsync(ea.DeliveryTag, false);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Consumer] Error procesando mensaje: {ex.Message}");
            if (_ch != null)
                await _ch.BasicNackAsync(ea.DeliveryTag, false, false);
        }
    }

    public async ValueTask DisposeAsync()
    {
        Console.WriteLine("[Consumer] Cerrando recursos de RabbitMQ...");
        if (_ch != null) await _ch.CloseAsync();
        if (_conn != null) await _conn.CloseAsync();
        Console.WriteLine("[Consumer] Recursos cerrados.");
    }
}

public record ReserveSeatsResponse(bool Success, string? Reason = null, int? AvailableSeats = null);
