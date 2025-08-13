using Bookings.Domain;
using Bookings.Infrastructure.Configs;
using Microsoft.EntityFrameworkCore;

namespace Bookings.Infrastructure;

public class BookingsDbContext : DbContext
{
    public BookingsDbContext(DbContextOptions<BookingsDbContext> options) : base(options) { }

    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<BookingSeat> BookingSeats => Set<BookingSeat>();
    public DbSet<Room> Rooms => Set<Room>();



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new SeatConfig());
        modelBuilder.ApplyConfiguration(new BookingConfig());
        modelBuilder.ApplyConfiguration(new BookingSeatConfig());
        modelBuilder.ApplyConfiguration(new RoomConfig());

    }
}
