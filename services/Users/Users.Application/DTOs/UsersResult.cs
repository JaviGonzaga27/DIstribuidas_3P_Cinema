namespace Users.Application.DTOs;

public record UsersResult(string AccessToken, int UserId, string Email, string RefreshToken);
