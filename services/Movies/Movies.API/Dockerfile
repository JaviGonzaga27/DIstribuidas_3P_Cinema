FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "services/Movies/Movies.API/Movies.API.csproj"
RUN dotnet build "services/Movies/Movies.API/Movies.API.csproj" -c Release -o /app/build
RUN dotnet publish "services/Movies/Movies.API/Movies.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Movies.API.dll"]
