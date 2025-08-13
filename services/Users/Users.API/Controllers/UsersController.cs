using Microsoft.AspNetCore.Mvc;
using Users.Application.DTOs;
using Users.Application.Interface;

namespace Users.API.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly IUserProfilesService _service;

    public UsersController(IUserProfilesService service)
    {
        this._service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUserProfiles(CancellationToken cancellationToken)
    {
        var users = await this._service.GetAllUserProfiles(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUserProfileById(int id, CancellationToken cancellationToken)
    {
        var user = await this._service.GetUserProfileById(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpGet("auth/{userId:int}")]
    public async Task<IActionResult> GetUserProfileByUserId(int userId, CancellationToken cancellationToken)
    {
        var user = await this._service.GetUserProfileByUserId(userId, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UserProfileDto dto, CancellationToken cancellationToken)
    {
        dto.Id = id;
        await this._service.UpdateUserProfile(dto, cancellationToken);
        return Ok(new { message = "User profile updated" });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUserProfile(int id, CancellationToken cancellationToken)
    {
        await this._service.DeleteUserProfile(id, cancellationToken);
        return NoContent();
    }
}
