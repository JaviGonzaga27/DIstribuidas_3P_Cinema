using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RabbitMQ.Client;
using Reviews.Application.Interface;
using Reviews.Application.Messaging;
using Reviews.Application.Services;
using Reviews.Infrastructure;
using Reviews.Infrastructure.Configs;
using Reviews.Infrastructure.Messaging;
using Reviews.Infrastructure.Repositories;
using System.Text;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

var dbConn = DbConfig.GetConnectionString();
builder.Services.AddDbContext<ReviewsDbContext>(options =>
    options.UseNpgsql(dbConn));

builder.Services.AddSingleton<IConnectionFactory>(_ =>
    new ConnectionFactory { Uri = new Uri(Environment.GetEnvironmentVariable("RABBITMQ_URI")) });

builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddSingleton<ReviewValidationAggregator>();
builder.Services.AddSingleton<IHostedService, ReviewValidationAggregator>();
builder.Services.AddSingleton<ReviewEventPublisher>();

var jwtSecret = builder.Configuration["JWT_SECRET"]
             ?? throw new InvalidOperationException("JWT_SECRET missing");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "api-cinema-reviews";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
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
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "API-CINEMA Reviews", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] { }
        }
    });
});

builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:80");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Reviews v1"));
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ReviewsDbContext>();
    db.Database.Migrate();
}

app.Run();
