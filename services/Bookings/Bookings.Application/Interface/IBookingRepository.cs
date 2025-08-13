using Bookings.Domain;

namespace Bookings.Application.Interface
{
    public interface IBookingRepository
    {
        Task<List<Booking>> GetAllAsync(CancellationToken ct);
        Task<Booking?> GetByIdAsync(int id, CancellationToken ct);
        Task<List<Booking>> GetByUserIdAsync(int userId, CancellationToken ct);
        Task<List<Booking>> GetByShowtimeIdAsync(int showtimeId, CancellationToken ct);
        Task<Booking> AddAsync(Booking booking, CancellationToken ct);
        Task UpdateAsync(Booking booking, CancellationToken ct);
        Task<bool> CancelAsync(int id, CancellationToken ct);
        Task<bool> ExistsAsync(int id, CancellationToken ct);
        Task<bool> ConfirmAsync(int id, CancellationToken ct);
    }
}
