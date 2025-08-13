namespace Bookings.Infrastructure.Messaging.Events
{
    public record ReserveSeatsCommand(
    int BookingId,
    int ShowtimeId,
    int SeatId,
    int Quantity
);

    public record SeatsReservedEvent(
        int BookingId,
        int ShowtimeId,
        int SeatId
    );

    public record SeatsReservationFailedEvent(
        int BookingId,
        string Reason
    );
}
