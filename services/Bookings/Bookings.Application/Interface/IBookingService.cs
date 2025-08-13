using Bookings.Application.DTOs;

namespace Bookings.Application.Interface;

public interface IBookingService
{
    Task<BookingDto> CreateAsync(CreateBookingDto dto, CancellationToken ct);
    Task<BookingDto?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<BookingDto>> GetAllAsync(CancellationToken ct);
    Task<bool> CancelAsync(int id, CancellationToken ct);
    Task<List<object>> GetAvailableSeatsForShowtimeAsync(int showtimeId, CancellationToken ct);
}
