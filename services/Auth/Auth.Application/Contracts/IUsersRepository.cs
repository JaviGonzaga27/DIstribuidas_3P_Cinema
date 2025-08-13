using Auth.Domain;

namespace Auth.Application.Contracts;

public interface IUsersRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
    Task AddAsync(User user, CancellationToken ct);
    Task UpdateAsync(User user, CancellationToken ct);
    Task<bool> ExistsAsync(int id, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task<int> GetUserCountAsync(CancellationToken ct);
}
