namespace Auth.Application.DTOs;

public record AuthResult(string AccessToken, int UserId, string Email, string RefreshToken);
