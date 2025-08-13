using Auth.Application.Contracts;
using Auth.Domain;
using Microsoft.EntityFrameworkCore;

namespace Auth.Infrastructure.Repositories;
public class UsersRepository : IUsersRepository
{
    private readonly AuthDbContext _context;

    public UsersRepository(AuthDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct)
        => await _context.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task AddAsync(User user, CancellationToken ct)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(User user, CancellationToken ct)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken ct)
    {
        return await _context.Users.AnyAsync(m => m.Id == id, cancellationToken: ct);
    }
    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var user = await _context.Users.FindAsync(new object[] { id }, ct);

        if (user is null)
            return;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<int> GetUserCountAsync(CancellationToken ct)
    {
        return await _context.Users.CountAsync(ct);
    }
}
