var builder = WebApplication.CreateBuilder(args);

// Configuración
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://frontend:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Usar CORS
app.UseCors("AllowFrontend");

// Página base que muestra enlaces a los Swagger de cada microservicio
app.MapGet("/", async context =>
{
    var html = @"
<!DOCTYPE html>
<html>
<head>
    <title>API Gateway - Documentación</title>
</head>
<body>
    <h1>Swagger de Microservicios</h1>
    <ul>
        <li><a href=""/auth/swagger/index.html"" target=""_blank"">Auth API</a></li>
        <li><a href=""/users/swagger/index.html"" target=""_blank"">Users API</a></li>
        <li><a href=""/movies/swagger/index.html"" target=""_blank"">Movies API</a></li>
        <li><a href=""/catalog/swagger/index.html"" target=""_blank"">Catalog API</a></li>
        <li><a href=""/bookings/swagger/index.html"" target=""_blank"">Bookings API</a></li>
        <li><a href=""/reviews/swagger/index.html"" target=""_blank"">Reviews API</a></li>
    </ul>
</body>
</html>";
    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(html);
});

// Redirige a cada Swagger UI de microservicio vía proxy
app.MapGet("/swagger/auth", ctx =>
{
    ctx.Response.Redirect("/auth/swagger/index.html", false);
    return Task.CompletedTask;
});

app.MapGet("/swagger/users", ctx =>
{
    ctx.Response.Redirect("/users/swagger/index.html", false);
    return Task.CompletedTask;
});

app.MapGet("/swagger/movies", ctx =>
{
    ctx.Response.Redirect("/movies/swagger/index.html", false);
    return Task.CompletedTask;
});

app.MapGet("/swagger/catalog", ctx =>
{
    ctx.Response.Redirect("/catalog/swagger/index.html", false);
    return Task.CompletedTask;
});

app.MapGet("/swagger/bookings", ctx =>
{
    ctx.Response.Redirect("/bookings/swagger/index.html", false);
    return Task.CompletedTask;
});

app.MapGet("/swagger/reviews", ctx =>
{
    ctx.Response.Redirect("/reviews/swagger/index.html", false);
    return Task.CompletedTask;
});

app.MapReverseProxy();

app.Run();
