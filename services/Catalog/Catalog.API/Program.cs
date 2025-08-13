using Catalog.API.Hubs;
using Catalog.Application.Interface;
using Catalog.Application.Services;
using Catalog.Infrastructure;
using Catalog.Infrastructure.Configs;
using Catalog.Infrastructure.Messaging;
using Catalog.Infrastructure.Messaging.Consumer;
using Catalog.Infrastructure.Messaging.Listeners;
using Catalog.Infrastructure.Messaging.Listener;
using Catalog.Infrastructure.Repositories;
using Catalog.Infrastructure.Services;
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
builder.Services.AddDbContext<CatalogDbContext>(o => o.UseNpgsql(dbConn));

var rabbitUri = Environment.GetEnvironmentVariable("RABBITMQ_URI")
              ?? builder.Configuration["RabbitMq:Uri"]
              ?? "amqp://guest:guest@localhost:5672/";

builder.Services.AddSingleton<IConnectionFactory>(_ => new ConnectionFactory
{
    Uri = new Uri(rabbitUri)
});

builder.Services.AddScoped<IShowtimeRepository, ShowtimeRepository>();
builder.Services.AddScoped<IShowtimeService, ShowtimeService>();
builder.Services.AddScoped<IEventBus, RabbitMqEventBus>();
builder.Services.AddHostedService<RabbitMqSeatReservationConsumer>();
builder.Services.AddHostedService<ShowtimeRpcConsumer>();


var jwtSecret = builder.Configuration["JWT_SECRET"]
             ?? throw new InvalidOperationException("JWT_SECRET missing");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "api-cinema-Catalog";

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
        Title = "API-CINEMA Catalog",
        Version = "v1"
    });
});


builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:80");
builder.Services.AddSignalR();
builder.Services.AddScoped<INotificationService, SignalRNotificationService>();
builder.Services.AddHostedService<MovieCreatedListener>();

var app = builder.Build();
app.MapHub<TicketHub>("/ws/tickets");

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Catalog v1"));

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    db.Database.Migrate();
}
app.Run();
