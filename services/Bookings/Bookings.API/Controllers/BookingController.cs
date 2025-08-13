using Bookings.Application.DTOs;
using Bookings.Application.Interface;
using Bookings.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bookings.API.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        this._bookingService = bookingService;
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingDto dto, CancellationToken ct)
    {
        var booking = await this._bookingService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    [HttpGet]
    public async Task<ActionResult<List<BookingDto>>> GetAll(CancellationToken ct)
    {
        var bookings = await this._bookingService.GetAllAsync(ct);
        return Ok(bookings);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingDto>> GetById(int id, CancellationToken ct)
    {
        var booking = await this._bookingService.GetByIdAsync(id, ct);
        return booking is null ? NotFound() : Ok(booking);
    }

    [HttpGet("showtime/{showtimeId:int}/seats")]
    public async Task<ActionResult<List<object>>> GetAvailableSeatsForShowtime(int showtimeId, CancellationToken ct)
    {
        try
        {
            var availableSeats = await this._bookingService.GetAvailableSeatsForShowtimeAsync(showtimeId, ct);
            return Ok(availableSeats);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error getting available seats: {ex.Message}");
        }
    }
}
