namespace Auth.Application.DTOs;

public record LoginResponseDto(
    string Token,
    string RefreshToken,
    UserDto User
);

public record UserDto(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
