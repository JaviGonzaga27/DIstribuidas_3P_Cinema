namespace Bookings.Application.DTOs;

public record CreateRoomDto(string Name, int Rows, int SeatsPerRow);

public record SeatInfoDto(int Id, string Row, int Number);

public record RoomDto(int Id, string Name, List<SeatInfoDto> Seats);
