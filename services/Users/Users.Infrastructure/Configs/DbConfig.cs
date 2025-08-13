using DotNetEnv;

namespace Users.Infrastructure.Configs;

public static class DbConfig
{
    public static string GetConnectionString()
    {
        // Cargar variables si no est�n ya definidas
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("AUTH_DB_CONNECTION")))
        {
            Env.Load(); // Carga el .env si no se ha hecho a�n
        }

        var conn = Environment.GetEnvironmentVariable("AUTH_DB_CONNECTION");

        if (string.IsNullOrWhiteSpace(conn))
            throw new InvalidOperationException("AUTH_DB_CONNECTION no est� definida en el entorno ni en el .env");

        return conn;
    }
}
