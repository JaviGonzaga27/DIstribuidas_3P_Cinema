using Users.Application.DTOs;

namespace Users.Application.Interface
{
    public interface IUserProfilesService
    {
        Task<RegisterUserProfileResponse> RegisterUserProfile(RegisterUserDto dto, CancellationToken cancellationToken);

        Task<UserProfileDto?> GetUserProfileById(int id, CancellationToken cancellationToken);
        Task<IEnumerable<UserProfileDto>> GetAllUserProfiles(CancellationToken cancellationToken);
        Task<UserProfileDto?> GetUserProfileByUserId(int userId, CancellationToken cancellationToken);
        Task UpdateUserProfile(UserProfileDto dto, CancellationToken cancellationToken);
        Task DeleteUserProfile(int id, CancellationToken cancellationToken);
    }
}
