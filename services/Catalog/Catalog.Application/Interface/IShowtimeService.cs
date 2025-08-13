using Catalog.Application.DTOs;

namespace Catalog.Application.Interface;

public interface IShowtimeService
{
    Task<List<ShowtimeDto>> GetAllAsync(CancellationToken ct);
    Task<ShowtimeDto?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<ShowtimeDto>> GetByMovieIdAsync(int movieId, CancellationToken ct);
    Task CreateAsync(ShowtimeDto dto, CancellationToken ct);
    Task UpdateAsync(int id, ShowtimeDto dto, CancellationToken ct);
    Task<bool> DeleteAsync(int id, CancellationToken ct);
    Task<bool> CreateMultipleAsync(int movieId, List<ShowtimeDto> showtimes, CancellationToken ct);

    Task<int> GetAvailableSeatsAsync(int showtimeId, CancellationToken ct);
    Task<bool> ReserveSeatsAsync(int showtimeId, int seats, CancellationToken ct);
    Task<bool> ReleaseSeatsAsync(int showtimeId, int seats, CancellationToken ct);
}
