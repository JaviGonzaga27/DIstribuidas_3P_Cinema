using Catalog.Domain;

namespace Catalog.Application.Interface;

public interface IShowtimeRepository
{
    Task<List<Showtime>> GetAllAsync(CancellationToken ct);
    Task<Showtime?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<Showtime>> GetByMovieIdAsync(int movieId, CancellationToken ct);
    Task AddAsync(Showtime showtime, CancellationToken ct);
    Task UpdateAsync(Showtime showtime, CancellationToken ct);
    Task<bool> DeleteAsync(int id, CancellationToken ct);

    Task<bool> ExistsAsync(int id, CancellationToken ct);
    Task<int> GetAvailableSeatsAsync(int showtimeId, CancellationToken ct);
    Task<bool> ReserveSeatsAsync(int showtimeId, int seats, CancellationToken ct);
    Task<bool> ReleaseSeatsAsync(int showtimeId, int seats, CancellationToken ct);
    Task<bool> TryReserveSeatsAsync(int showtimeId, int quantity, CancellationToken ct = default);

}

