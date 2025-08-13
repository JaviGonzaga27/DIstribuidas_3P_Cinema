using Bookings.Infrastructure.Configs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Bookings.Infrastructure;

public class BookingsDbContextFactory : IDesignTimeDbContextFactory<BookingsDbContext>
{
    public BookingsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<BookingsDbContext>();
        optionsBuilder.UseNpgsql(DbConfig.GetConnectionString());

        return new BookingsDbContext(optionsBuilder.Options);
    }
}
