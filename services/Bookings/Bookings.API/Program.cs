
using Bookings.Application.Interface;
using Bookings.Application.Services;
using Bookings.Infrastructure;
using Bookings.Infrastructure.Configs;
using Bookings.Infrastructure.Messaging;
using Bookings.Infrastructure.Messaging.Consumer;
using Bookings.Infrastructure.Repositories;
using Bookings.API.Hubs;
using Bookings.API.Services;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Movies.Application.Interface;
using RabbitMQ.Client;
using System.Text;


Env.Load();
var builder = WebApplication.CreateBuilder(args);

var dbConn = DbConfig.GetConnectionString();
builder.Services.AddDbContext<BookingsDbContext>(o => o.UseNpgsql(dbConn));

var rabbitUri = Environment.GetEnvironmentVariable("RABBITMQ_URI")
              ?? builder.Configuration["RabbitMq:Uri"];

builder.Services.AddSingleton<IConnectionFactory>(_ => new ConnectionFactory
{
    Uri = new Uri(rabbitUri)
});

builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ISeatRepository, SeatRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddSingleton<IRabbitRpcClient, RabbitRpcClient>();
builder.Services.AddHostedService<RabbitMqBookingConsumer>();

// Configurar SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<ISeatRealtimeService, SeatRealtimeService>();

var jwtSecret = builder.Configuration["JWT_SECRET"]
             ?? throw new InvalidOperationException("JWT_SECRET missing");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "api-cinema-Bookings";

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
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API-CINEMA Bookings",
        Version = "v1"
    });
});



builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:80");

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bookings v1"));

// Usar CORS
app.UseCors("AllowFrontend");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BookingHub>("/booking-hub");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookingsDbContext>();
    db.Database.Migrate();
}
app.Run();
