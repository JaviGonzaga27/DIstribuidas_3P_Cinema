using Bookings.Application.Interface;
using Bookings.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bookings.Infrastructure.Repositories;

public sealed class BookingRepository : IBookingRepository
{
    private readonly BookingsDbContext _context;

    public BookingRepository(BookingsDbContext context)
    {
        this._context = context;
    }

    public async Task<List<Booking>> GetAllAsync(CancellationToken ct)
    {
        return await this._context.Bookings
            .Include(b => b.BookingSeats)
            .ThenInclude(bs => bs.Seat)
            .ToListAsync(ct);
    }

    public async Task<Booking?> GetByIdAsync(int id, CancellationToken ct)
    {
        return await this._context.Bookings
            .Include(b => b.BookingSeats)
            .ThenInclude(bs => bs.Seat)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
    }

    public async Task<List<Booking>> GetByUserIdAsync(int userId, CancellationToken ct)
    {
        return await this._context.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.BookingSeats)
            .ThenInclude(bs => bs.Seat)
            .ToListAsync(ct);
    }

    public async Task<List<Booking>> GetByShowtimeIdAsync(int showtimeId, CancellationToken ct)
    {
        return await this._context.Bookings
            .Where(b => b.ShowtimeId == showtimeId)
            .Include(b => b.BookingSeats)
            .ThenInclude(bs => bs.Seat)
            .ToListAsync(ct);
    }

    public async Task<Booking> AddAsync(Booking booking, CancellationToken ct)
    {
        await using var tx = await this._context.Database.BeginTransactionAsync(ct);

        var seatIds = booking.BookingSeats.Select(bs => bs.SeatId).ToList();

        var existingIds = await this._context.Seats
            .Where(s => seatIds.Contains(s.Id))
            .Select(s => s.Id)
            .ToListAsync(ct);

        var missingIds = seatIds.Except(existingIds).ToList();
        if (missingIds.Any())
            throw new InvalidOperationException($"Seat IDs not found: {string.Join(',', missingIds)}");

        await this._context.Bookings.AddAsync(booking, ct);
        await this._context.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return booking;
    }

    public async Task<bool> ConfirmAsync(int id, CancellationToken ct)
    {
        var booking = await this._context.Bookings.FindAsync(new object[] { id }, ct);
        if (booking is null) return false;

        booking.Status = "Confirmed";
        await this._context.SaveChangesAsync(ct);
        return true;
    }

    public async Task UpdateAsync(Booking booking, CancellationToken ct)
    {
        this._context.Bookings.Update(booking);
        await this._context.SaveChangesAsync(ct);
    }

    public async Task<bool> CancelAsync(int id, CancellationToken ct)
    {
        var booking = await this._context.Bookings
            .Include(b => b.BookingSeats)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking is null || booking.Status == "Cancelled")
            return false;

        booking.Status = "Cancelled";
        await this._context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken ct)
    {
        return await this._context.Bookings.AnyAsync(b => b.Id == id, ct);
    }
}
