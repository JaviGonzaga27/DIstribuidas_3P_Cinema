using Microsoft.AspNetCore.Mvc;
using Bookings.API.Services;

namespace Bookings.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeatRealtimeController : ControllerBase
{
    private readonly ISeatRealtimeService _seatRealtimeService;

    public SeatRealtimeController(ISeatRealtimeService seatRealtimeService)
    {
        _seatRealtimeService = seatRealtimeService;
    }

    [HttpGet("showtime/{showtimeId}/active-selections")]
    public async Task<IActionResult> GetActiveSelections(int showtimeId)
    {
        try
        {
            var selections = await _seatRealtimeService.GetActiveSelectionsAsync(showtimeId);
            return Ok(selections);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("showtime/{showtimeId}/seat/{seatId}/select")]
    public async Task<IActionResult> SelectSeat(int showtimeId, int seatId, [FromBody] SelectSeatRequest request)
    {
        try
        {
            await _seatRealtimeService.SelectSeatAsync(showtimeId, seatId, request.UserId, request.ConnectionId);
            return Ok(new { message = "Seat selected successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("showtime/{showtimeId}/seat/{seatId}/release")]
    public async Task<IActionResult> ReleaseSeat(int showtimeId, int seatId, [FromBody] ReleaseSeatRequest request)
    {
        try
        {
            await _seatRealtimeService.ReleaseSeatAsync(showtimeId, seatId, request.UserId, request.ConnectionId);
            return Ok(new { message = "Seat released successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public record SelectSeatRequest(string UserId, string ConnectionId);
public record ReleaseSeatRequest(string UserId, string ConnectionId);
