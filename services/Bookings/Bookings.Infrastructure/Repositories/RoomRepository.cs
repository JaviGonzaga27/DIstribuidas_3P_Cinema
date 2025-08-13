using Bookings.Application.Interface;
using Bookings.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bookings.Infrastructure.Repositories;

public sealed class RoomRepository : IRoomRepository
{
    private readonly BookingsDbContext _context;

    public RoomRepository(BookingsDbContext context)
    {
        this._context = context;
    }

    public async Task<Room> AddAsync(Room room, CancellationToken ct)
    {
        await this._context.Rooms.AddAsync(room, ct);
        await this._context.SaveChangesAsync(ct);
        return room;
    }

    public async Task<Room?> GetByIdAsync(int id, CancellationToken ct)
    {
        return await this._context.Rooms
            .Include(r => r.Seats)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<List<Room>> GetAllAsync(CancellationToken ct)
    {
        return await this._context.Rooms
            .Include(r => r.Seats)
            .ToListAsync(ct);
    }

    public async Task<List<Seat>> GetSeatsByRoomIdAsync(int roomId, CancellationToken ct)
    {
        return await this._context.Seats
            .Where(s => s.RoomId == roomId)
            .ToListAsync(ct);
    }

    public async Task<List<Seat>> GetAvailableSeatsForShowtimeAsync(int showtimeId, CancellationToken ct)
    {
        // Obtener los asientos ocupados para este showtime
        var occupiedSeatIds = await this._context.BookingSeats
            .Where(bs => bs.Booking.ShowtimeId == showtimeId && bs.Booking.Status == "Confirmed")
            .Select(bs => bs.SeatId)
            .ToListAsync(ct);

        // TODO: Obtener el roomId del showtime desde el servicio de Catalog
        // Por ahora, vamos a asumir que el showtime está en la sala que corresponde
        // Necesitamos implementar comunicación entre servicios
        
        // Como solución temporal, vamos a devolver todos los asientos de todas las salas
        // y filtrar los ocupados
        var allSeats = await this._context.Seats
            .ToListAsync(ct);

        // Filtrar asientos disponibles
        return allSeats.Where(s => !occupiedSeatIds.Contains(s.Id)).ToList();
    }
}
