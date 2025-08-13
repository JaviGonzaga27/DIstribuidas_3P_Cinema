using Microsoft.EntityFrameworkCore;
using Users.Application.Interface;
using Users.Domain;

namespace Users.Infrastructure.Repositories;

public class UsersRepository : IUsersRepository
{
    private readonly UsersDbContext _context;

    public UsersRepository(UsersDbContext context)
        => _context = context;

    public async Task<UserProfile?> GetByIdAsync(int id, CancellationToken ct)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task<IEnumerable<UserProfile>> GetAllAsync(CancellationToken ct)
    {
        return await _context.Users
            .AsNoTracking()
            .ToListAsync(ct);
    }

    public async Task<UserProfile?> GetByUserIdAsync(int userId, CancellationToken ct)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == userId, ct);
    }

    public async Task AddAsync(UserProfile user, CancellationToken ct)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(UserProfile user, CancellationToken ct)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var entity = await _context.Users.FindAsync(new object[] { id }, ct);
        if (entity != null)
        {
            _context.Users.Remove(entity);
            await _context.SaveChangesAsync(ct);
        }
    }
}
