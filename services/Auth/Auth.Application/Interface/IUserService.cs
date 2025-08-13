using Auth.Application.Commands;
using Auth.Application.DTOs;

namespace Auth.Application.Interfaces
{
    public interface IUserService
    {
        Task<AuthResult> RegisterUser(RegisterUserDto command, CancellationToken cancellationToken = default);
        Task<AuthResult> RegisterClient(RegisterUserDto command, CancellationToken cancellationToken = default);
        Task<AuthResult> RegisterFirstAdmin(RegisterUserDto command, CancellationToken cancellationToken = default);
        Task<AuthResult> LoginUser(string email, string password, CancellationToken cancellationToken = default);
    }
}
