FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "services/Auth/Auth.API/Auth.API.csproj"
RUN dotnet build "services/Auth/Auth.API/Auth.API.csproj" -c Release -o /app/build
RUN dotnet publish "services/Auth/Auth.API/Auth.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Auth.API.dll"]
