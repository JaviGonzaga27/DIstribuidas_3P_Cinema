using Auth.Application.Commands;
using Auth.Application.DTOs;
using Auth.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _svc;

    public AuthController(IUserService svc)
    {
        this._svc = svc;
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RegisterUser([FromBody] RegisterUserDto dto)
    {
        var result = await this._svc.RegisterUser(dto);
        return Ok(result);
    }

    [HttpPost("register-client")]
    public async Task<IActionResult> RegisterClient([FromBody] RegisterUserDto dto)
    {
        // Registro público para clientes
        var result = await this._svc.RegisterClient(dto);
        return Ok(result);
    }

    [HttpPost("register-first-admin")]
    public async Task<IActionResult> RegisterFirstAdmin([FromBody] RegisterUserDto dto)
    {
        // Solo permitir si no hay usuarios en el sistema
        var result = await this._svc.RegisterFirstAdmin(dto);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginUser([FromBody] LoginUserdto cmd)
    {
        var result = await this._svc.LoginUser(cmd.Email, cmd.Password);
        return Ok(result);
    }
}
