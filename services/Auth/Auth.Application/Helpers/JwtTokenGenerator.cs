using Auth.Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Auth.Application.Helpers;

public record JwtTokens(string AccessToken, string RefreshToken);

public class JwtTokenGenerator
{
    private readonly string _secret;
    private readonly string _refreshSecret;
    private readonly string _issuer;
    private readonly int _expirationMinutes;
    private readonly int _refreshExpirationDays;
    public int RefreshTokenDays => _refreshExpirationDays;
    public JwtTokenGenerator(IConfiguration config)
    {
        _secret = config["JWT_SECRET"] ?? throw new InvalidOperationException("JWT_SECRET no está definido.");
        _refreshSecret = config["JWT_REFRESH_SECRET"] ?? throw new InvalidOperationException("JWT_REFRESH_SECRET no está definido.");
        _issuer = config["JWT_ISSUER"] ?? "api-cinema";
        _expirationMinutes = int.Parse(config["JWT_EXPIRATION_MINUTES"] ?? "180");
        _refreshExpirationDays = int.Parse(config["JWT_REFRESH_EXPIRATION_DAYS"] ?? "7");

    }

    public JwtTokens GenerateTokens(User user)
    {
        var accessToken = GenerateJwt(user.Id.ToString(), _secret, TimeSpan.FromMinutes(_expirationMinutes));
        var refreshToken = GenerateJwt(user.Id.ToString(), _refreshSecret, TimeSpan.FromDays(_refreshExpirationDays));
        return new JwtTokens(accessToken, refreshToken);
    }

    private string GenerateJwt(string userId, string secret, TimeSpan expiresIn)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _issuer,
            expires: DateTime.UtcNow.Add(expiresIn),
            signingCredentials: creds,
            claims: new[] { new Claim(JwtRegisteredClaimNames.Sub, userId) });

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
