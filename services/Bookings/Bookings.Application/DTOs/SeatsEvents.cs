namespace Bookings.Application.DTOs
{
    public record ReserveSeatsCommand(
    int BookingId,
    int ShowtimeId,
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
    public record ReserveSeatsResponse(bool Success, string? Reason);

}
