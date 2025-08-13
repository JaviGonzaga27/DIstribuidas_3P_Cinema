using Bookings.Application.DTOs;
using Bookings.Application.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Bookings.API.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        this._roomService = roomService;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoomDto>>> GetAll(CancellationToken ct)
    {
        var rooms = await this._roomService.GetAllRoomsAsync(ct);
        return Ok(rooms);
    }

    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create(CreateRoomDto dto, CancellationToken ct)
    {
        var room = await this._roomService.CreateRoomAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetById(int id, CancellationToken ct)
    {
        var room = await this._roomService.GetRoomByIdAsync(id, ct);
        return room is null ? NotFound() : Ok(room);
    }

    [HttpGet("{id:int}/seats")]
    public async Task<ActionResult<List<SeatInfoDto>>> GetSeats(int id, CancellationToken ct)
    {
        var seats = await this._roomService.GetSeatsByRoomIdAsync(id, ct);
        return Ok(seats);
    }

    [HttpGet("{roomId:int}/showtimes/{showtimeId:int}/available-seats")]
    public async Task<ActionResult<List<SeatInfoDto>>> GetAvailableSeats(int roomId, int showtimeId, CancellationToken ct)
    {
        var seats = await this._roomService.GetAvailableSeatsAsync(roomId, showtimeId, ct);
        return Ok(seats);
    }
}
