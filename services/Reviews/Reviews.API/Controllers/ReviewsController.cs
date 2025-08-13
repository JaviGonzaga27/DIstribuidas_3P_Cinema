using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reviews.Application.DTOs;
using Reviews.Application.Services;

namespace Reviews.Controllers;

[ApiController]
[Route("/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewService _service;
    private readonly ReviewEventPublisher _pub;

    public ReviewsController(ReviewService service, ReviewEventPublisher pub)
    {
        _service = service;
        _pub = pub;
    }

    [HttpGet("movie/{movieId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByMovie(int movieId, CancellationToken ct)
    {
        var reviews = await _service.GetByMovieAsync(movieId, ct);
        return Ok(reviews);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var review = await _service.GetByIdAsync(id, ct);
        return review is null ? NotFound() : Ok(review);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReviewDto dto, CancellationToken ct)
    {
        try
        {
            await _service.RequestReviewAsync(dto, ct);
            return Accepted(new { message = "Review creation in progress" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ReviewDto dto, CancellationToken ct)
    {
        dto.Id = id;
        await _service.UpdateAsync(dto, ct);
        return Ok(new { message = "Review updated" });
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var reviews = await _service.GetAllAsync(ct);
        return Ok(reviews);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        return NoContent();
    }
}
