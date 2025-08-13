using Users.Application.DTOs;
using Users.Application.Interface;
using Users.Domain;

namespace Users.Application.Services;

public class UserProfilesService : IUserProfilesService
{
    private readonly IUsersRepository _repository;

    public UserProfilesService(IUsersRepository repository)
    {
        this._repository = repository;
    }

    public async Task<RegisterUserProfileResponse> RegisterUserProfile(RegisterUserDto dto, CancellationToken cancellationToken)
    {
        var entity = new UserProfile
        {
            UserId = dto.Id,
            FullName = dto.FullName,
            BirthDate = dto.BirthDate,
            PhoneNumber = dto.PhoneNumber,
            Address = dto.Address,
            AuthUserId = dto.Id
        };

        var existing = await this._repository.GetByUserIdAsync(dto.Id, cancellationToken);
        if (existing is not null)
        {
            return new RegisterUserProfileResponse
            {
                Success = false,
                Reason = "Ya existe un perfil para este usuario."
            };
        }

        await this._repository.AddAsync(entity, cancellationToken);

        return new RegisterUserProfileResponse
        {
            Success = true
        };
    }

    public async Task<UserProfileDto?> GetUserProfileById(int id, CancellationToken cancellationToken)
    {
        var entity = await this._repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : this.MapToDto(entity);
    }

    public async Task<IEnumerable<UserProfileDto>> GetAllUserProfiles(CancellationToken cancellationToken)
    {
        var entities = await this._repository.GetAllAsync(cancellationToken);
        return entities.Select(this.MapToDto);
    }

    public async Task<UserProfileDto?> GetUserProfileByUserId(int userId, CancellationToken cancellationToken)
    {
        var entity = await this._repository.GetByUserIdAsync(userId, cancellationToken);
        return entity is null ? null : this.MapToDto(entity);
    }

    public async Task UpdateUserProfile(UserProfileDto dto, CancellationToken cancellationToken)
    {
        var entity = this.MapToEntity(dto);
        await this._repository.UpdateAsync(entity, cancellationToken);
    }

    public async Task DeleteUserProfile(int id, CancellationToken cancellationToken)
    {
        await this._repository.DeleteAsync(id, cancellationToken);
    }

    private UserProfileDto MapToDto(UserProfile entity)
    {
        return new UserProfileDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            FullName = entity.FullName,
            BirthDate = entity.BirthDate,
            PhoneNumber = entity.PhoneNumber,
            Address = entity.Address
        };
    }

    private UserProfile MapToEntity(UserProfileDto dto)
    {
        return new UserProfile
        {
            Id = dto.Id,
            UserId = dto.UserId,
            FullName = dto.FullName,
            BirthDate = dto.BirthDate,
            PhoneNumber = dto.PhoneNumber,
            Address = dto.Address,
            AuthUserId = dto.Id
        };
    }
}
