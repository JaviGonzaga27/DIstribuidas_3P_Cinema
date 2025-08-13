using Bookings.Domain;

namespace Bookings.Application.Interface;

public interface IRoomRepository
{
    Task<Room> AddAsync(Room room, CancellationToken ct);
    Task<Room?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<Room>> GetAllAsync(CancellationToken ct);
    Task<List<Seat>> GetSeatsByRoomIdAsync(int roomId, CancellationToken ct);
    Task<List<Seat>> GetAvailableSeatsForShowtimeAsync(int showtimeId, CancellationToken ct);
}
