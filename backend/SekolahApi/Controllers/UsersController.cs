using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.Entities;
using SekolahApi.Models.Enums;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? PhotoPath { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; }
    }

    public class UpdateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string? Password { get; set; }
        public UserRole Role { get; set; }
    }

    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UsersController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] UserRole? role = null)
        {
            var query = _context.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => u.Username.Contains(search));
            }

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            var result = await query
                .OrderBy(u => u.Username)
                .ToPagedListAsync(page, pageSize, u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Role = u.Role,
                    PhotoPath = u.PhotoPath,
                    CreatedAt = u.CreatedAt
                });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Allow if admin or the user themselves
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("ADMIN") && userIdClaim != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                PhotoPath = user.PhotoPath,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
            if (exists) return BadRequest(new { message = "Username sudah terdaftar." });

            var user = new User
            {
                Username = dto.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                PhotoPath = user.PhotoPath,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username && u.Id != id);
            if (exists) return BadRequest(new { message = "Username sudah digunakan oleh akun lain." });

            user.Username = dto.Username;
            user.Role = dto.Role;
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                PhotoPath = user.PhotoPath,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User berhasil dihapus (soft delete)." });
        }

        [HttpPost("{id}/photo")]
        public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("ADMIN") && userIdClaim != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Akun user tidak ditemukan." });

            var (success, filePath, errorMessage) = await FileUploadHelper.SavePhotoAsync(file, _env, "photos");
            if (!success)
            {
                return BadRequest(new { message = errorMessage });
            }

            FileUploadHelper.DeleteFile(user.PhotoPath, _env);

            user.PhotoPath = filePath;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Foto akun berhasil diunggah.",
                photoPath = filePath,
                user = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    PhotoPath = user.PhotoPath,
                    CreatedAt = user.CreatedAt
                }
            });
        }

        [HttpDelete("{id}/photo")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("ADMIN") && userIdClaim != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Akun user tidak ditemukan." });

            if (!string.IsNullOrEmpty(user.PhotoPath))
            {
                FileUploadHelper.DeleteFile(user.PhotoPath, _env);
                user.PhotoPath = null;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Foto akun berhasil dihapus." });
        }
    }
}
