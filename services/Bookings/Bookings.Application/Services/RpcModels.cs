namespace Bookings.Application.Services;

// Requests para RPC
public record GetUserRequest(int UserId);
public record GetShowtimeRequest(int ShowtimeId);

// Responses para RPC
public record GetUserResponse(int Id, string UserName, string Email);
public record GetShowtimeResponse(int Id, string MovieTitle, DateTime StartTime, string Room);
