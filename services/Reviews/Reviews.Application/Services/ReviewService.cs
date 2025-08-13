using Reviews.Application.DTOs;
using Reviews.Application.Interface;
using Reviews.Application.Messaging;
using Reviews.Application.Messaging.Events;
using Reviews.Domain;

namespace Reviews.Application.Services;
public class ReviewService
{
    private readonly IReviewRepository _repository;
    private readonly IEventBus _eventBus;

    public ReviewService(IReviewRepository repository, IEventBus eventBus)
    {
        _repository = repository;
        _eventBus = eventBus;
    }

    public async Task<List<ReviewDto>> GetByMovieAsync(int movieId, CancellationToken ct)
    {
        var reviews = await _repository.GetByMovieIdAsync(movieId, ct);
        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            UserId = r.UserId,
            MovieId = r.MovieId,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    public async Task<ReviewDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var review = await _repository.GetByIdAsync(id, ct);
        return review == null ? null : new ReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            MovieId = review.MovieId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task RequestReviewAsync(ReviewDto dto, CancellationToken ct)
    {
        var existingReviews = await _repository.GetByMovieIdAsync(dto.MovieId, ct);
        var alreadyReviewed = existingReviews.Any(r => r.UserId == dto.UserId);
        if (alreadyReviewed)
            throw new InvalidOperationException("El usuario ya ha publicado una reseña para esta película.");

        var @event = new ReviewCreateRequested
        {
            UserId = dto.UserId,
            MovieId = dto.MovieId,
            Comment = dto.Comment,
            Rating = dto.Rating
        };
        await _eventBus.PublishAsync(@event, "review.create.requested", ct);
    }

    public async Task AddAsync(ReviewDto dto, CancellationToken ct)
    {
        var review = new Review
        {
            UserId = dto.UserId,
            MovieId = dto.MovieId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(review, ct);

        var @event = new ReviewCreatedEvent
        {
            ReviewId = review.Id,
            UserId = review.UserId,
            MovieId = review.MovieId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };

        await _eventBus.PublishAsync(@event, "review.created", ct);
    }

    public async Task UpdateAsync(ReviewDto dto, CancellationToken ct)
    {
        var existing = await _repository.GetByIdAsync(dto.Id, ct);
        if (existing is null) return;

        existing.Rating = dto.Rating;
        existing.Comment = dto.Comment;

        await _repository.UpdateAsync(existing, ct);
    }

    public async Task<List<ReviewDto>> GetAllAsync(CancellationToken ct)
    {
        var reviews = await _repository.GetAllAsync(ct);
        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            UserId = r.UserId,
            MovieId = r.MovieId,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();
    }
}
