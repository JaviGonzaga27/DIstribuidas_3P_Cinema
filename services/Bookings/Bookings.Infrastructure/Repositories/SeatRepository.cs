using Bookings.Application.Interface;
using Bookings.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bookings.Infrastructure.Repositories;

public sealed class SeatRepository : ISeatRepository
{
    private readonly BookingsDbContext _context;

    public SeatRepository(BookingsDbContext context)
    {
        this._context = context;
    }

    public async Task<List<Seat>> GetAllAsync(CancellationToken ct)
    {
        return await this._context.Seats.ToListAsync(ct);
    }

    public async Task<Seat?> GetByIdAsync(int id, CancellationToken ct)
    {
        return await this._context.Seats.FindAsync(new object[] { id }, ct);
    }

    public async Task<List<Seat>> GetByRoomIdAsync(int roomId, CancellationToken ct)
    {
        return await this._context.Seats
            .Where(s => s.RoomId == roomId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Seat seat, CancellationToken ct)
    {
        await this._context.Seats.AddAsync(seat, ct);
        await this._context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Seat seat, CancellationToken ct)
    {
        this._context.Seats.Update(seat);
        await this._context.SaveChangesAsync(ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct)
    {
        var seat = await this._context.Seats.FindAsync(new object[] { id }, ct);
        if (seat is null) return false;

        this._context.Seats.Remove(seat);
        await this._context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken ct)
    {
        return await this._context.Seats.AnyAsync(s => s.Id == id, ct);
    }
}
