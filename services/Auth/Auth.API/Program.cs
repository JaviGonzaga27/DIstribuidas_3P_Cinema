using Auth.Application.Contracts;
using Auth.Application.Helpers;
using Auth.Application.Interfaces;
using Auth.Application.Services;
using Auth.Domain;
using Auth.Infrastructure;
using Auth.Infrastructure.Configs;
using Auth.Infrastructure.Messaging;
using Auth.Infrastructure.Repositories;
using DotNetEnv;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RabbitMQ.Client;
using System.Text;


Env.Load();
var builder = WebApplication.CreateBuilder(args);

var dbConn = DbConfig.GetConnectionString();
builder.Services.AddDbContext<AuthDbContext>(o => o.UseNpgsql(dbConn));

var rabbitUri = Environment.GetEnvironmentVariable("RABBITMQ_URI")
              ?? builder.Configuration["RabbitMq:Uri"];

builder.Services.AddSingleton<IConnectionFactory>(_ =>
   new ConnectionFactory { Uri = new Uri(Environment.GetEnvironmentVariable("RABBITMQ_URI")) });


builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

var jwtSecret = builder.Configuration["JWT_SECRET"]
             ?? throw new InvalidOperationException("JWT_SECRET missing");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "api-cinema-auth";

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddHostedService<ReviewUserValidationListener>();
builder.Services.AddSingleton<IRpcClient, RabbitRpcClient>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API-CINEMA Auth",
        Version = "v1"
    });
});

builder.Services.AddSingleton<JwtTokenGenerator>();

builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:80");
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth v1"));

app.UseCors("AllowAll");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    db.Database.Migrate();
}
app.Run();
