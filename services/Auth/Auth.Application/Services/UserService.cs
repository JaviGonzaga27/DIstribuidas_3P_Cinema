using Auth.Application.Commands;
using Auth.Application.Contracts;
using Auth.Application.DTOs;
using Auth.Application.Helpers;
using Auth.Application.Interface;
using Auth.Application.Interfaces;
using Auth.Domain;
using Microsoft.AspNetCore.Identity;
using RabbitMQ.Client;

namespace Auth.Application.Services;

public class UserService : IUserService
{
    private readonly IUsersRepository _repository;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IEventBus _eventBus;
    private readonly IRpcClient _rpcClient;
    private readonly JwtTokenGenerator _tokenGenerator;

    public UserService(
        IUsersRepository repository,
        IPasswordHasher<User> passwordHasher,
        IEventBus eventBus,
        IRpcClient rpcClient,
        JwtTokenGenerator tokenGenerator)
    {
        this._repository = repository;
        this._passwordHasher = passwordHasher;
        this._eventBus = eventBus;
        this._rpcClient = rpcClient;
        this._tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResult> RegisterUser(RegisterUserDto dto, CancellationToken cancellationToken)
    {
        var existingUser = await this._repository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingUser is not null)
            throw new InvalidOperationException("Ya existe un usuario con este correo electr�nico.");

        var newUser = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            Role = "Admin" // Solo permitir crear administradores a través de este endpoint
        };

        newUser.Password = this._passwordHasher.HashPassword(newUser, dto.Password);

        await this._repository.AddAsync(newUser, cancellationToken);

        dto.Password = string.Empty;

        var rpcResponse = await this._rpcClient.RequestAsync<RegisterUserDto, RegisterUserProfileResponse>(
            exchange: "users.exchange",
            routingKey: "users.profile.create",
            message: new RegisterUserDto
            {
                Email = dto.Email,
                Name = dto.Name,
                Role = "Admin", // Asegurar que el perfil también sea Admin
                FullName = dto.FullName,
                BirthDate = dto.BirthDate,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                Password = string.Empty,
            },
            timeout: TimeSpan.FromSeconds(5)
            );

        if (!rpcResponse.Success)
        {
            await this._repository.DeleteAsync(newUser.Id, cancellationToken);
            throw new InvalidOperationException(rpcResponse.Reason ?? "No se pudo crear el perfil de usuario.");
        }

        var tokens = this._tokenGenerator.GenerateTokens(newUser);

        return new AuthResult(tokens.AccessToken, newUser.Id, newUser.Email, tokens.RefreshToken);
    }

    public async Task<AuthResult> RegisterClient(RegisterUserDto dto, CancellationToken cancellationToken)
    {
        var existingUser = await this._repository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingUser is not null)
            throw new InvalidOperationException("Ya existe un usuario con este correo electrónico.");

        var newUser = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            Role = "Client" // Rol específico para clientes que solo pueden ver cartelera y comprar
        };

        newUser.Password = this._passwordHasher.HashPassword(newUser, dto.Password);

        await this._repository.AddAsync(newUser, cancellationToken);

        dto.Password = string.Empty;

        var rpcResponse = await this._rpcClient.RequestAsync<RegisterUserDto, RegisterUserProfileResponse>(
            exchange: "users.exchange",
            routingKey: "users.profile.create",
            message: new RegisterUserDto
            {
                Email = dto.Email,
                Name = dto.Name,
                Role = "Client", // Asegurar que el perfil también sea Client
                FullName = dto.FullName,
                BirthDate = dto.BirthDate,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                Password = string.Empty,
            },
            timeout: TimeSpan.FromSeconds(5)
            );

        if (!rpcResponse.Success)
        {
            await this._repository.DeleteAsync(newUser.Id, cancellationToken);
            throw new InvalidOperationException(rpcResponse.Reason ?? "No se pudo crear el perfil de usuario.");
        }

        var tokens = this._tokenGenerator.GenerateTokens(newUser);

        return new AuthResult(tokens.AccessToken, newUser.Id, newUser.Email, tokens.RefreshToken);
    }


    public async Task<AuthResult> LoginUser(string email, string password, CancellationToken cancellationToken)
    {
        var user = await this._repository.GetByEmailAsync(email, cancellationToken);
        if (user is null)
            throw new InvalidOperationException("Credenciales inv�lidas.");

        var verification = this._passwordHasher.VerifyHashedPassword(user, user.Password, password);
        if (verification == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Credenciales inv�lidas.");

        var tokens = this._tokenGenerator.GenerateTokens(user);

        user.RefreshToken = tokens.RefreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(this._tokenGenerator.RefreshTokenDays);

        await this._repository.UpdateAsync(user, cancellationToken);

        return new AuthResult(tokens.AccessToken, user.Id, user.Email, tokens.RefreshToken);
    }

    public async Task<AuthResult> RegisterFirstAdmin(RegisterUserDto dto, CancellationToken cancellationToken)
    {
        // Verificar que no existan usuarios en el sistema
        var userCount = await this._repository.GetUserCountAsync(cancellationToken);
        if (userCount > 0)
            throw new InvalidOperationException("Solo se puede crear el primer administrador cuando no hay usuarios en el sistema.");

        var existingUser = await this._repository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingUser is not null)
            throw new InvalidOperationException("Ya existe un usuario con este correo electrónico.");

        var newUser = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            Role = "Admin" // Forzar rol de Admin para el primer usuario
        };

        newUser.Password = this._passwordHasher.HashPassword(newUser, dto.Password);

        await this._repository.AddAsync(newUser, cancellationToken);

        dto.Password = string.Empty;

        var rpcResponse = await this._rpcClient.RequestAsync<RegisterUserDto, RegisterUserProfileResponse>(
            exchange: "users.exchange",
            routingKey: "users.profile.create",
            message: new RegisterUserDto
            {
                Email = dto.Email,
                Name = dto.Name,
                Role = "Admin", // Asegurar que el perfil también sea Admin
                FullName = dto.FullName,
                BirthDate = dto.BirthDate,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                Password = string.Empty,
            },
            timeout: TimeSpan.FromSeconds(5)
            );

        if (!rpcResponse.Success)
        {
            await this._repository.DeleteAsync(newUser.Id, cancellationToken);
            throw new InvalidOperationException(rpcResponse.Reason ?? "No se pudo crear el perfil de usuario.");
        }

        var tokens = this._tokenGenerator.GenerateTokens(newUser);

        return new AuthResult(tokens.AccessToken, newUser.Id, newUser.Email, tokens.RefreshToken);
    }
}
