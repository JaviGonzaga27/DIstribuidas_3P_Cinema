using Microsoft.EntityFrameworkCore;
using Reviews.Domain;
using Reviews.Infrastructure.Configs;

namespace Reviews.Infrastructure;

public class ReviewsDbContext : DbContext
{
    public ReviewsDbContext(DbContextOptions<ReviewsDbContext> options) : base(options) { }

    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new ReviewConfig());
    }
}
