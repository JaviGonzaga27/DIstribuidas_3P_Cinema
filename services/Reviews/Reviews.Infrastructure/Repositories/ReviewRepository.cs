using Microsoft.EntityFrameworkCore;
using Reviews.Application.Interface;
using Reviews.Domain;

namespace Reviews.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly ReviewsDbContext _context;

    public ReviewRepository(ReviewsDbContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(int id, CancellationToken ct)
        => await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<List<Review>> GetByMovieIdAsync(int movieId, CancellationToken ct)
        => await _context.Reviews
                         .Where(r => r.MovieId == movieId)
                         .ToListAsync(ct);

    public async Task AddAsync(Review review, CancellationToken ct)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Review review, CancellationToken ct)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync(ct);
    }
    public async Task<List<Review>> GetAllAsync(CancellationToken ct)
    {
        return await _context.Reviews.ToListAsync(ct);
    }

}
