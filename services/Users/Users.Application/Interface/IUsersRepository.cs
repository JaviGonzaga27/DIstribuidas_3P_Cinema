using Users.Domain;

namespace Users.Application.Interface
{
    public interface IUsersRepository
    {
        Task<UserProfile?> GetByIdAsync(int id, CancellationToken ct);
        Task<IEnumerable<UserProfile>> GetAllAsync(CancellationToken ct);
        Task<UserProfile?> GetByUserIdAsync(int userId, CancellationToken ct);
        Task AddAsync(UserProfile user, CancellationToken ct);
        Task UpdateAsync(UserProfile user, CancellationToken ct);
        Task DeleteAsync(int id, CancellationToken ct);
    }
}
