using Bookings.Application.DTOs;
using Bookings.Application.Interface;
using Bookings.Domain;

namespace Bookings.Application.Services;

public sealed class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepo;
    private readonly IBookingRepository _bookingRepo;

    public RoomService(IRoomRepository roomRepo, IBookingRepository bookingRepo)
    {
        this._roomRepo = roomRepo;
        this._bookingRepo = bookingRepo;
    }

    public async Task<RoomDto> CreateRoomAsync(CreateRoomDto dto, CancellationToken ct)
    {
        var room = new Room { Name = dto.Name };
        for (var r = 0; r < dto.Rows; r++)
        {
            var rowLetter = ((char)('A' + r)).ToString();
            for (var n = 1; n <= dto.SeatsPerRow; n++)
                room.Seats.Add(new Seat { Row = rowLetter, Number = n });
        }
        room = await this._roomRepo.AddAsync(room, ct);
        return Map(room);
    }

    public async Task<RoomDto?> GetRoomByIdAsync(int id, CancellationToken ct)
    {
        var room = await this._roomRepo.GetByIdAsync(id, ct);
        return room is null ? null : Map(room);
    }

    public async Task<List<RoomDto>> GetAllRoomsAsync(CancellationToken ct)
    {
        var rooms = await this._roomRepo.GetAllAsync(ct);
        return rooms.Select(Map).ToList();
    }

    public async Task<List<SeatInfoDto>> GetSeatsByRoomIdAsync(int roomId, CancellationToken ct)
    {
        var room = await this._roomRepo.GetByIdAsync(roomId, ct);
        return room?.Seats.Select(s => new SeatInfoDto(s.Id, s.Row, s.Number)).ToList() ?? new List<SeatInfoDto>();
    }

    public async Task<List<SeatInfoDto>> GetAvailableSeatsAsync(int roomId, int showtimeId, CancellationToken ct)
    {
        var room = await this._roomRepo.GetByIdAsync(roomId, ct);
        if (room is null) return new List<SeatInfoDto>();

        // Obtener asientos reservados para este showtime
        var bookings = await this._bookingRepo.GetByShowtimeIdAsync(showtimeId, ct);
        var reservedSeatIds = bookings
            .Where(b => b.Status == "Confirmed" || b.Status == "Pending")
            .SelectMany(b => b.BookingSeats.Select(bs => bs.SeatId))
            .ToHashSet();

        // Filtrar asientos disponibles
        var availableSeats = room.Seats
            .Where(s => !s.IsDisabled && !reservedSeatIds.Contains(s.Id))
            .Select(s => new SeatInfoDto(s.Id, s.Row, s.Number))
            .ToList();

        return availableSeats;
    }

    private static RoomDto Map(Room r) =>
        new(r.Id, r.Name, r.Seats.Select(s => new SeatInfoDto(s.Id, s.Row, s.Number)).ToList());
}
