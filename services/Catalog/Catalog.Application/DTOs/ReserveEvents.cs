
namespace Catalog.Application.DTOs
{
    public record ReserveSeatsCommand(int BookingId, int ShowtimeId, int Quantity);
    public record SeatsReservedEvent(int BookingId, int ShowtimeId, int Quantity);
    public record SeatsReservationFailedEvent(int BookingId, string Reason);
}
