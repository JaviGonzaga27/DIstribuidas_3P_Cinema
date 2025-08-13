using Bookings.Application.DTOs;

namespace Bookings.Application.Interface;

public interface IRoomService
{
    Task<RoomDto> CreateRoomAsync(CreateRoomDto dto, CancellationToken ct);
    Task<RoomDto?> GetRoomByIdAsync(int id, CancellationToken ct);
    Task<List<RoomDto>> GetAllRoomsAsync(CancellationToken ct);
    Task<List<SeatInfoDto>> GetSeatsByRoomIdAsync(int roomId, CancellationToken ct);
    Task<List<SeatInfoDto>> GetAvailableSeatsAsync(int roomId, int showtimeId, CancellationToken ct);
}
