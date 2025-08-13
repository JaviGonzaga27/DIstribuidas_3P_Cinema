using Reviews.Domain;

namespace Reviews.Application.Interface;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<Review>> GetByMovieIdAsync(int movieId, CancellationToken ct);
    Task AddAsync(Review review, CancellationToken ct);
    Task UpdateAsync(Review review, CancellationToken ct);
    Task<List<Review>> GetAllAsync(CancellationToken ct);

}
