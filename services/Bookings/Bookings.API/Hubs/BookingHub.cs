using Microsoft.AspNetCore.SignalR;

namespace Bookings.API.Hubs;

public class BookingHub : Hub
{
    public async Task JoinShowtimeGroup(string showtimeId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"showtime_{showtimeId}");
        await Clients.Group($"showtime_{showtimeId}").SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task LeaveShowtimeGroup(string showtimeId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"showtime_{showtimeId}");
        await Clients.Group($"showtime_{showtimeId}").SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task SelectSeat(string showtimeId, int seatId, string userId)
    {
        // Notificar a todos los usuarios en este showtime que un asiento fue seleccionado
        await Clients.Group($"showtime_{showtimeId}").SendAsync("SeatSelected", new
        {
            SeatId = seatId,
            UserId = userId,
            ConnectionId = Context.ConnectionId,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task ReleaseSeat(string showtimeId, int seatId, string userId)
    {
        // Notificar que un asiento fue liberado
        await Clients.Group($"showtime_{showtimeId}").SendAsync("SeatReleased", new
        {
            SeatId = seatId,
            UserId = userId,
            ConnectionId = Context.ConnectionId,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task ReserveSeat(string showtimeId, int seatId, string userId)
    {
        // Notificar que un asiento fue reservado definitivamente
        await Clients.Group($"showtime_{showtimeId}").SendAsync("SeatReserved", new
        {
            SeatId = seatId,
            UserId = userId,
            ConnectionId = Context.ConnectionId,
            Timestamp = DateTime.UtcNow
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Cuando un usuario se desconecta, liberar todos sus asientos seleccionados
        await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
