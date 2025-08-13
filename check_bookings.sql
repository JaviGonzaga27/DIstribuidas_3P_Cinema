-- Verificar los datos en la tabla de reservas
SELECT 
    b."Id" as booking_id,
    b."UserId",
    b."ShowtimeId", 
    b."BookingDate",
    b."Status",
    array_agg(bs."SeatId") as seat_ids
FROM "Bookings" b
LEFT JOIN "BookingSeats" bs ON b."Id" = bs."BookingId"
GROUP BY b."Id", b."UserId", b."ShowtimeId", b."BookingDate", b."Status"
ORDER BY b."Id" DESC;
