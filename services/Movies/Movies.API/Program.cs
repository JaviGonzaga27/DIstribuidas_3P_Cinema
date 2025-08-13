using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Movies.Application.Interface;
using Movies.Application.Services;
using Movies.Infrastructure;
using Movies.Infrastructure.Configs;
using Movies.Infrastructure.Messaging;
using Movies.Infrastructure.Repositories;
using RabbitMQ.Client;
using System.Text;


Env.Load();
var builder = WebApplication.CreateBuilder(args);

var dbConn = DbConfig.GetConnectionString();
builder.Services.AddDbContext<MoviesDbContext>(o => o.UseNpgsql(dbConn));

var rabbitUri = Environment.GetEnvironmentVariable("RABBITMQ_URI")
              ?? builder.Configuration["RabbitMq:Uri"];

builder.Services.AddSingleton<IConnectionFactory>(_ =>
   new ConnectionFactory { Uri = new Uri(Environment.GetEnvironmentVariable("RABBITMQ_URI")) });

builder.Services.AddScoped<IMovieRepository, MovieRepository>();
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddScoped<IMovieService, MovieService>();

var jwtSecret = builder.Configuration["JWT_SECRET"]
             ?? throw new InvalidOperationException("JWT_SECRET missing");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "api-cinema-Movies";
builder.Services.AddHostedService<ReviewMovieValidationListener>();

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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API-CINEMA Movies",
        Version = "v1"
    });
});

builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:80");

var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Movies v1"));

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MoviesDbContext>();
    db.Database.Migrate();
}

app.Run();
