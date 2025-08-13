using Bookings.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookings.Infrastructure.Configs
{
    public class BookingSeatConfig : IEntityTypeConfiguration<BookingSeat>
    {
        public void Configure(EntityTypeBuilder<BookingSeat> builder)
        {
            builder.ToTable("BookingSeats");

            builder.HasKey(bs => new { bs.BookingId, bs.SeatId });

            builder.HasOne(bs => bs.Booking)
                   .WithMany(b => b.BookingSeats)
                   .HasForeignKey(bs => bs.BookingId);

            builder.HasOne(bs => bs.Seat)
                   .WithMany(s => s.BookingSeats)
                   .HasForeignKey(bs => bs.SeatId);
        }
    }
}
