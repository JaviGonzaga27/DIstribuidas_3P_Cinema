SELECT MIN("Id") as min_seat_id, MAX("Id") as max_seat_id, COUNT(*) as total
FROM "Seats" 
WHERE "RoomId" = 2;
