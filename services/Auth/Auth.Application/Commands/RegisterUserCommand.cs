namespace Auth.Application.Commands;

public record RegisterUserCommand(string Email, string Name, string Password);
