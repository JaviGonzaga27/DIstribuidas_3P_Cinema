# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar csproj y restaurar
COPY gateway/API.Gateway/API.Gateway.csproj ./gateway/API.Gateway/
RUN dotnet restore ./gateway/API.Gateway/API.Gateway.csproj

# Copiar todo y compilar
COPY . .
RUN dotnet publish ./gateway/API.Gateway/API.Gateway.csproj -c Release -o /out

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

ENTRYPOINT ["dotnet", "API.Gateway.dll"]
