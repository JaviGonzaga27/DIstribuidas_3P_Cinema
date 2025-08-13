using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RabbitMQ.Client;
using System.Text;
using Users.Application.Interface;
using Users.Application.Services;
using Users.Infrastructure;
using Users.Infrastructure.Configs;
using Users.Infrastructure.Messaging;
using Users.Infrastructure.Messaging.Listener;
using Users.Infrastructure.Repositories;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Conexión a PostgreSQL
var dbConn = DbConfig.GetConnectionString();
builder.Services.AddDbContext<UsersDbContext>(o => o.UseNpgsql(dbConn));

// RabbitMQ
var rabbitUri = Environment.GetEnvironmentVariable("RABBITMQ_URI")
              ?? builder.Configuration["RabbitMq:Uri"];
builder.Services.AddSingleton<IConnectionFactory>(_ => new ConnectionFactory
{
    Uri = new Uri(rabbitUri)
});

// Inyección de dependencias
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IUserProfilesService, UserProfilesService>();
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddHostedService<UserProfileRpcConsumer>();


// JWT
var jwtSecret = builder.Configuration["JWT_SECRET"]
             ?? throw new InvalidOperationException("JWT_SECRET missing");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "api-cinema-users";

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

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API-CINEMA Users",
        Version = "v1"
    });
});

builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:80");

var app = builder.Build();

// Middleware
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Users v1"));

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UsersDbContext>();
    db.Database.Migrate();
}

app.Run();
