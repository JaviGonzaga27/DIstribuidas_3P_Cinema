using Catalog.Application.Interface;
using Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Infrastructure.Repositories
{
    public class ShowtimeRepository : IShowtimeRepository
    {
        private readonly CatalogDbContext _context;

        public ShowtimeRepository(CatalogDbContext context)
        {
            _context = context;
        }

        public async Task<List<Showtime>> GetAllAsync(CancellationToken ct)
        {
            return await _context.Showtimes.ToListAsync(ct);
        }

        public async Task<Showtime?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _context.Showtimes.FindAsync(new object[] { id }, ct);
        }

        public async Task<List<Showtime>> GetByMovieIdAsync(int movieId, CancellationToken ct)
        {
            return await _context.Showtimes
                .Where(s => s.MovieId == movieId)
                .ToListAsync(ct);
        }

        public async Task AddAsync(Showtime showtime, CancellationToken ct)
        {
            await _context.Showtimes.AddAsync(showtime, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(Showtime showtime, CancellationToken ct)
        {
            _context.Showtimes.Update(showtime);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct)
        {
            var showtime = await _context.Showtimes.FindAsync(new object[] { id }, ct);
            if (showtime == null) return false;

            _context.Showtimes.Remove(showtime);
            await _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> ExistsAsync(int id, CancellationToken ct)
        {
            return await _context.Showtimes.AnyAsync(s => s.Id == id, ct);
        }

        public async Task<int> GetAvailableSeatsAsync(int showtimeId, CancellationToken ct)
        {
            var showtime = await _context.Showtimes.FindAsync(new object[] { showtimeId }, ct);
            return showtime?.AvailableSeats ?? 0;
        }

        public async Task<bool> ReserveSeatsAsync(int showtimeId, int seats, CancellationToken ct)
        {
            var showtime = await _context.Showtimes.FindAsync(new object[] { showtimeId }, ct);
            if (showtime == null || showtime.AvailableSeats < seats)
                return false;

            showtime.AvailableSeats -= seats;
            await _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> ReleaseSeatsAsync(int showtimeId, int seats, CancellationToken ct)
        {
            var showtime = await _context.Showtimes.FindAsync(new object[] { showtimeId }, ct);
            if (showtime == null || showtime.AvailableSeats + seats > showtime.TotalSeats)
                return false;

            showtime.AvailableSeats += seats;
            await _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> TryReserveSeatsAsync(int showtimeId,
                                                int qty,
                                                CancellationToken ct = default)
        {
            await using var tx = await _context.Database.BeginTransactionAsync(ct);

            try
            {
                var st = await _context.Showtimes
                                       .FirstOrDefaultAsync(x => x.Id == showtimeId, ct);

                if (st == null || st.AvailableSeats < qty)
                {
                    await tx.RollbackAsync(ct);
                    return false;
                }

                st.AvailableSeats -= qty;

                await _context.SaveChangesAsync(ct);
                await tx.CommitAsync(ct);

                return true;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync(ct);
                return false;
            }
        }
    }
}
