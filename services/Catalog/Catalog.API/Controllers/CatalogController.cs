using Catalog.Application.DTOs;
using Catalog.Application.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Controllers;

[ApiController]
[Route("showtimes")]
public class ShowtimesController : ControllerBase
{
    private readonly IShowtimeService _service;

    public ShowtimesController(IShowtimeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var data = await _service.GetAllAsync(ct);
        return Ok(data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var show = await _service.GetByIdAsync(id, ct);
        return show is null ? NotFound() : Ok(show);
    }

    [HttpGet("movie/{movieId}")]
    public async Task<IActionResult> GetByMovie(int movieId, CancellationToken ct)
    {
        var list = await _service.GetByMovieIdAsync(movieId, ct);
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ShowtimeDto dto, CancellationToken ct)
    {
        await _service.CreateAsync(dto, ct);
        return Ok(new { message = "Showtime created" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ShowtimeDto dto, CancellationToken ct)
    {
        await _service.UpdateAsync(id, dto, ct);
        return Ok(new { message = "Showtime updated" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _service.DeleteAsync(id, ct);
        return ok ? Ok(new { message = "Showtime deleted" }) : NotFound();
    }

    [HttpGet("{id}/available-seats")]
    public async Task<IActionResult> GetAvailableSeats(int id, CancellationToken ct)
    {
        var seats = await _service.GetAvailableSeatsAsync(id, ct);
        return Ok(new { availableSeats = seats });
    }

    [HttpPost("{id}/reserve")]
    public async Task<IActionResult> ReserveSeats(int id, [FromQuery] int seats, CancellationToken ct)
    {
        var result = await _service.ReserveSeatsAsync(id, seats, ct);
        return result ? Ok(new { message = "Seats reserved" }) : BadRequest(new { error = "Not enough seats" });
    }

    [HttpPost("{id}/release")]
    public async Task<IActionResult> ReleaseSeats(int id, [FromQuery] int seats, CancellationToken ct)
    {
        var result = await _service.ReleaseSeatsAsync(id, seats, ct);
        return result ? Ok(new { message = "Seats released" }) : BadRequest(new { error = "Cannot release more than total seats" });
    }
}
