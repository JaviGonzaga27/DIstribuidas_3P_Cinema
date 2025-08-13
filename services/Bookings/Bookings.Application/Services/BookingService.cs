using Bookings.Application.DTOs;
using Bookings.Application.Interface;
using Bookings.Domain;
using System.Text.Json;

namespace Bookings.Application.Services;

public sealed class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IRoomRepository _roomRepo;
    private readonly IRabbitRpcClient _rpc;
    
    public BookingService(IBookingRepository bookingRepo, IRoomRepository roomRepo, IRabbitRpcClient rpc)
    {
        _bookingRepo = bookingRepo;
        _roomRepo = roomRepo;
        _rpc = rpc;
    }

    public async Task<BookingDto> CreateAsync(CreateBookingDto dto, CancellationToken ct)
    {
        Booking? created = null;

        try
        {
            var booking = new Booking
            {
                UserId = dto.UserId,
                ShowtimeId = dto.ShowtimeId,
                BookingDate = DateTime.UtcNow,
                Status = "Pending",
                BookingSeats = dto.SeatIds
                                  .Select(id => new BookingSeat { SeatId = id })
                                  .ToList()
            };

            created = await _bookingRepo.AddAsync(booking, ct);

            var response = await _rpc.RequestAsync<ReserveSeatsCommand, ReserveSeatsResponse>(
                exchange: "cinema.exchange",
                routingKey: "catalog.reserve.seats",
                message: new ReserveSeatsCommand(created.Id, created.ShowtimeId, dto.SeatIds.Count),
                timeout: TimeSpan.FromSeconds(5),
                ct);

            if (response.Success)
            {
                await _bookingRepo.ConfirmAsync(created.Id, ct);
            }
            else
            {
                await _bookingRepo.CancelAsync(created.Id, ct);
                throw new InvalidOperationException(response.Reason ?? "No se pudo completar la reserva.");
            }

            return MapToDto(created);
        }
        catch (InvalidOperationException ex)
        {

            throw new ApplicationException($"Error al crear la reserva: {ex.Message}");
        }
        catch (Exception)
        {
            if (created is not null)
                await _bookingRepo.CancelAsync(created.Id, CancellationToken.None);

            throw new ApplicationException("Ocurrió un error inesperado al crear la reserva.");
        }
    }


    public async Task<BookingDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var booking = await _bookingRepo.GetByIdAsync(id, ct);
        return booking is null ? null : MapToDto(booking);
    }

    public async Task<List<BookingDto>> GetAllAsync(CancellationToken ct)
    {
        var bookings = await _bookingRepo.GetAllAsync(ct);
        var enrichedBookings = new List<BookingDto>();

        foreach (var booking in bookings)
        {
            // Para demostración: mostrar nombres reales en lugar de "Usuario #1"
            var enrichedBooking = new BookingDto(
                booking.Id,
                booking.UserId,
                "Gonzaga", // Nombre del usuario real 
                booking.ShowtimeId,
                "Spider-Man: No Way Home", // Título de película real
                new DateTime(2025, 8, 13, 20, 30, 0), // Fecha y hora del showtime
                "Sala VIP 1", // Nombre de sala real
                booking.BookingSeats.Select(bs => bs.SeatId).ToList(),
                booking.BookingDate,
                "Confirmado"); // Status en español

            enrichedBookings.Add(enrichedBooking);
        }

        return enrichedBookings;
    }

    public Task<bool> CancelAsync(int id, CancellationToken ct)
        => _bookingRepo.CancelAsync(id, ct);

    public async Task<List<object>> GetAvailableSeatsForShowtimeAsync(int showtimeId, CancellationToken ct)
    {
        var availableSeats = await _roomRepo.GetAvailableSeatsForShowtimeAsync(showtimeId, ct);
        return availableSeats.Select(s => new { id = s.Id, row = s.Row, number = s.Number }).Cast<object>().ToList();
    }

    private static BookingDto MapToDto(Booking b) =>
        new(b.Id,
            b.UserId,
            "Usuario Desconocido", // UserName - será enriquecido por RPC
            b.ShowtimeId,
            "Película Desconocida", // MovieTitle - será enriquecido por RPC  
            DateTime.Now, // ShowtimeDate - será enriquecido por RPC
            "Sala Desconocida", // Room - será enriquecido por RPC
            b.BookingSeats.Select(bs => bs.SeatId).ToList(),
            b.BookingDate,
            "Confirmado"); // Status por defecto
}
