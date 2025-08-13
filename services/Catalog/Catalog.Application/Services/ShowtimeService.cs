using Catalog.Application.DTOs;
using Catalog.Application.Interface;
using Catalog.Domain;

namespace Catalog.Application.Services
{
    public class ShowtimeService : IShowtimeService
    {
        private readonly IShowtimeRepository _repository;
        private readonly INotificationService _notifier;

        public ShowtimeService(
            IShowtimeRepository repository,
            INotificationService notifier)
        {
            _repository = repository;
            _notifier = notifier;
        }
        public async Task<bool> CreateMultipleAsync(int movieId, List<ShowtimeDto> list, CancellationToken ct)
        {
            foreach (var dto in list)
            {
                var entity = new Showtime
                {
                    MovieId = movieId,
                    StartTime = dto.StartTime,
                    Room = dto.Room,
                    Price = dto.Price,
                    TotalSeats = dto.TotalSeats,
                    AvailableSeats = dto.AvailableSeats,
                    Language = dto.Language,
                    Format = dto.Format,
                    IsSubtitled = dto.IsSubtitled
                };

                await _repository.AddAsync(entity, ct);
            }

            return true;
        }

        public async Task<List<ShowtimeDto>> GetAllAsync(CancellationToken ct)
        {
            var list = await _repository.GetAllAsync(ct);
            return list.Select(Map).ToList();
        }

        public async Task<ShowtimeDto?> GetByIdAsync(int id, CancellationToken ct)
        {
            var show = await _repository.GetByIdAsync(id, ct);
            return show == null ? null : Map(show);
        }

        public async Task<List<ShowtimeDto>> GetByMovieIdAsync(int movieId, CancellationToken ct)
        {
            var list = await _repository.GetByMovieIdAsync(movieId, ct);
            return list.Select(Map).ToList();
        }

        public async Task CreateAsync(ShowtimeDto dto, CancellationToken ct)
        {
            var showtime = new Showtime
            {
                MovieId = dto.MovieId,
                StartTime = dto.StartTime.Kind == DateTimeKind.Unspecified ? 
                           DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc) : 
                           dto.StartTime.ToUniversalTime(),
                Room = dto.Room,
                Price = dto.Price,
                TotalSeats = dto.TotalSeats,
                AvailableSeats = dto.AvailableSeats,
                Language = dto.Language,
                Format = dto.Format,
                IsSubtitled = dto.IsSubtitled
            };

            await _repository.AddAsync(showtime, ct);
        }

        public async Task UpdateAsync(int id, ShowtimeDto dto, CancellationToken ct)
        {
            var showtime = await _repository.GetByIdAsync(id, ct);
            if (showtime == null) return;

            showtime.StartTime = dto.StartTime.Kind == DateTimeKind.Unspecified ? 
                               DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc) : 
                               dto.StartTime.ToUniversalTime();
            showtime.Room = dto.Room;
            showtime.Price = dto.Price;
            showtime.TotalSeats = dto.TotalSeats;
            showtime.AvailableSeats = dto.AvailableSeats;
            showtime.Language = dto.Language;
            showtime.Format = dto.Format;
            showtime.IsSubtitled = dto.IsSubtitled;

            await _repository.UpdateAsync(showtime, ct);
        }

        public Task<bool> DeleteAsync(int id, CancellationToken ct) =>
            _repository.DeleteAsync(id, ct);

        public Task<int> GetAvailableSeatsAsync(int showtimeId, CancellationToken ct) =>
            _repository.GetAvailableSeatsAsync(showtimeId, ct);

        public Task<bool> ReserveSeatsAsync(int showtimeId, int seats, CancellationToken ct) =>
            _repository.ReserveSeatsAsync(showtimeId, seats, ct);


        public Task<bool> ReleaseSeatsAsync(int showtimeId, int seats, CancellationToken ct) =>
            _repository.ReleaseSeatsAsync(showtimeId, seats, ct);


        public async Task<bool> SellSeatsAsync(int showtimeId, int seats, CancellationToken ct)
        {
            var ok = await _repository.ReserveSeatsAsync(showtimeId, seats, ct);
            if (!ok) return false;

            var remaining = await _repository.GetAvailableSeatsAsync(showtimeId, ct);
            await _notifier.NotifyTicketSoldAsync(showtimeId, remaining);
            return true;
        }

        public async Task<bool> ReleaseSeatsWithNotifyAsync(int showtimeId, int seats, CancellationToken ct)
        {
            var ok = await _repository.ReleaseSeatsAsync(showtimeId, seats, ct);
            if (!ok) return false;

            var remaining = await _repository.GetAvailableSeatsAsync(showtimeId, ct);
            await _notifier.NotifyTicketReleasedAsync(showtimeId, remaining);
            return true;
        }

        private static ShowtimeDto Map(Showtime s) => new()
        {
            Id = s.Id,
            MovieId = s.MovieId,
            StartTime = s.StartTime,
            Room = s.Room,
            Price = s.Price,
            TotalSeats = s.TotalSeats,
            AvailableSeats = s.AvailableSeats,
            Language = s.Language,
            Format = s.Format,
            IsSubtitled = s.IsSubtitled
        };
    }
}
