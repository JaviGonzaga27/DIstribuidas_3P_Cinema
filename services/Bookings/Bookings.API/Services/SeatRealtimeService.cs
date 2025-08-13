using Microsoft.AspNetCore.SignalR;
using Bookings.API.Hubs;
using System.Collections.Concurrent;

namespace Bookings.API.Services;

public interface ISeatRealtimeService
{
    Task SelectSeatAsync(int showtimeId, int seatId, string userId, string connectionId);
    Task ReleaseSeatAsync(int showtimeId, int seatId, string userId, string connectionId);
    Task ReserveSeatAsync(int showtimeId, int seatId, string userId);
    Task<List<SeatSelection>> GetActiveSelectionsAsync(int showtimeId);
    Task CleanupConnectionAsync(string connectionId);
}

public record SeatSelection(int SeatId, string UserId, string ConnectionId, DateTime SelectedAt);

public class SeatRealtimeService : ISeatRealtimeService
{
    private readonly IHubContext<BookingHub> _hubContext;
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<int, SeatSelection>> _activeSelections;
    private readonly Timer _cleanupTimer;

    public SeatRealtimeService(IHubContext<BookingHub> hubContext)
    {
        _hubContext = hubContext;
        _activeSelections = new ConcurrentDictionary<string, ConcurrentDictionary<int, SeatSelection>>();
        
        // Timer para limpiar selecciones expiradas cada 30 segundos
        _cleanupTimer = new Timer(CleanupExpiredSelections, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
    }

    public async Task SelectSeatAsync(int showtimeId, int seatId, string userId, string connectionId)
    {
        var showtimeKey = $"showtime_{showtimeId}";
        var selections = _activeSelections.GetOrAdd(showtimeKey, _ => new ConcurrentDictionary<int, SeatSelection>());

        // Verificar si el asiento ya está seleccionado por otro usuario
        if (selections.TryGetValue(seatId, out var existingSelection) && 
            existingSelection.ConnectionId != connectionId)
        {
            // Asiento ya está seleccionado por otro usuario
            await _hubContext.Clients.Client(connectionId).SendAsync("SeatAlreadySelected", new
            {
                SeatId = seatId,
                Message = "Este asiento ya está siendo seleccionado por otro usuario"
            });
            return;
        }

        // Seleccionar el asiento
        var selection = new SeatSelection(seatId, userId, connectionId, DateTime.UtcNow);
        selections.AddOrUpdate(seatId, selection, (_, _) => selection);

        // Notificar a todos en el grupo
        await _hubContext.Clients.Group(showtimeKey).SendAsync("SeatSelected", new
        {
            SeatId = seatId,
            UserId = userId,
            ConnectionId = connectionId,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task ReleaseSeatAsync(int showtimeId, int seatId, string userId, string connectionId)
    {
        var showtimeKey = $"showtime_{showtimeId}";
        var selections = _activeSelections.GetOrAdd(showtimeKey, _ => new ConcurrentDictionary<int, SeatSelection>());

        // Solo liberar si el asiento está seleccionado por este usuario
        if (selections.TryGetValue(seatId, out var selection) && selection.ConnectionId == connectionId)
        {
            selections.TryRemove(seatId, out _);

            // Notificar a todos en el grupo
            await _hubContext.Clients.Group(showtimeKey).SendAsync("SeatReleased", new
            {
                SeatId = seatId,
                UserId = userId,
                ConnectionId = connectionId,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    public async Task ReserveSeatAsync(int showtimeId, int seatId, string userId)
    {
        var showtimeKey = $"showtime_{showtimeId}";
        var selections = _activeSelections.GetOrAdd(showtimeKey, _ => new ConcurrentDictionary<int, SeatSelection>());

        // Remover de selecciones activas y notificar reserva final
        selections.TryRemove(seatId, out _);

        await _hubContext.Clients.Group(showtimeKey).SendAsync("SeatReserved", new
        {
            SeatId = seatId,
            UserId = userId,
            Timestamp = DateTime.UtcNow
        });
    }

    public Task<List<SeatSelection>> GetActiveSelectionsAsync(int showtimeId)
    {
        var showtimeKey = $"showtime_{showtimeId}";
        if (_activeSelections.TryGetValue(showtimeKey, out var selections))
        {
            return Task.FromResult(selections.Values.ToList());
        }
        return Task.FromResult(new List<SeatSelection>());
    }

    public async Task CleanupConnectionAsync(string connectionId)
    {
        var showtimesToNotify = new List<string>();

        // Buscar y remover todas las selecciones de esta conexión
        foreach (var showtimeEntry in _activeSelections)
        {
            var toRemove = new List<int>();
            foreach (var seatEntry in showtimeEntry.Value)
            {
                if (seatEntry.Value.ConnectionId == connectionId)
                {
                    toRemove.Add(seatEntry.Key);
                    showtimesToNotify.Add(showtimeEntry.Key);
                }
            }

            foreach (var seatId in toRemove)
            {
                showtimeEntry.Value.TryRemove(seatId, out var removedSelection);
                
                // Notificar que el asiento fue liberado
                if (removedSelection != null)
                {
                    await _hubContext.Clients.Group(showtimeEntry.Key).SendAsync("SeatReleased", new
                    {
                        SeatId = seatId,
                        UserId = removedSelection.UserId,
                        ConnectionId = connectionId,
                        Timestamp = DateTime.UtcNow,
                        Reason = "User disconnected"
                    });
                }
            }
        }
    }

    private void CleanupExpiredSelections(object? state)
    {
        var expiredThreshold = DateTime.UtcNow.AddMinutes(-10); // 10 minutos de expiración

        foreach (var showtimeEntry in _activeSelections)
        {
            var toRemove = new List<int>();
            foreach (var seatEntry in showtimeEntry.Value)
            {
                if (seatEntry.Value.SelectedAt < expiredThreshold)
                {
                    toRemove.Add(seatEntry.Key);
                }
            }

            foreach (var seatId in toRemove)
            {
                showtimeEntry.Value.TryRemove(seatId, out var expiredSelection);
                
                // Notificar que el asiento expiró
                if (expiredSelection != null)
                {
                    _hubContext.Clients.Group(showtimeEntry.Key).SendAsync("SeatReleased", new
                    {
                        SeatId = seatId,
                        UserId = expiredSelection.UserId,
                        ConnectionId = expiredSelection.ConnectionId,
                        Timestamp = DateTime.UtcNow,
                        Reason = "Selection expired"
                    });
                }
            }
        }
    }
}
