using Movies.Application.DTOs;

namespace Movies.Application.Interface
{
    public interface IMovieService
    {
        Task<IEnumerable<MovieDto>> GetAllAsync();
        Task<MovieDto?> GetByIdAsync(int id);
        Task<MovieDto> CreateAsync(CreateMovieDto input);
        Task<MovieDto?> UpdateAsync(int id, CreateMovieDto input);
        Task<bool> DeleteAsync(int id);
    }
}
