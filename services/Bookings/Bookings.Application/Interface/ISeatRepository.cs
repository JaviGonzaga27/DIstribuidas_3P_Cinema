using Bookings.Domain;

namespace Bookings.Application.Interface;

public interface ISeatRepository
{
    Task<List<Seat>> GetAllAsync(CancellationToken ct);
    Task<Seat?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<Seat>> GetByRoomIdAsync(int roomId, CancellationToken ct);
    Task AddAsync(Seat seat, CancellationToken ct);
    Task UpdateAsync(Seat seat, CancellationToken ct);
    Task<bool> DeleteAsync(int id, CancellationToken ct);
    Task<bool> ExistsAsync(int id, CancellationToken ct);
}
