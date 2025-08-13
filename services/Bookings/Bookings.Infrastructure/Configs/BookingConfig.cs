using Bookings.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bookings.Infrastructure.Configs
{
    public class BookingConfig : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings");

            builder.HasKey(b => b.Id);

            builder.Property(b => b.UserId).IsRequired();
            builder.Property(b => b.ShowtimeId).IsRequired();
            builder.Property(b => b.BookingDate).IsRequired();
            builder.Property(b => b.Status).HasMaxLength(20).IsRequired();
        }
    }
}
