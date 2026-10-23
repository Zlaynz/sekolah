using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.DTOs.Teachers;
using SekolahApi.Models.Entities;
using SekolahApi.Models.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/teachers")]
    [Authorize]
    public class TeachersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeachersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var query = _context.Teachers
                .Include(t => t.User)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.FullName.Contains(search) || (t.Nip != null && t.Nip.Contains(search)));
            }

            var result = await query
                .OrderBy(t => t.FullName)
                .ToPagedListAsync(page, pageSize, t => new TeacherDto
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    Username = t.User != null ? t.User.Username : null,
                    Nip = t.Nip,
                    FullName = t.FullName,
                    Gender = t.Gender,
                    Position = t.Position,
                    SignaturePath = t.SignaturePath,
                    CreatedAt = t.CreatedAt
                });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var t = await _context.Teachers
                .Include(x => x.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (t == null) return NotFound();

            return Ok(new TeacherDto
            {
                Id = t.Id,
                UserId = t.UserId,
                Username = t.User?.Username,
                Nip = t.Nip,
                FullName = t.FullName,
                Gender = t.Gender,
                Position = t.Position,
                SignaturePath = t.SignaturePath,
                CreatedAt = t.CreatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateTeacherDto dto)
        {
            int? createdUserId = null;

            if (!string.IsNullOrWhiteSpace(dto.Username) && !string.IsNullOrWhiteSpace(dto.Password))
            {
                var existingUser = await _context.Users.AnyAsync(u => u.Username == dto.Username);
                if (existingUser) return BadRequest(new { message = "Username sudah digunakan." });

                var role = dto.Position == TeacherPosition.WAKASEK ? UserRole.WAKASEK :
                           dto.Position == TeacherPosition.KEPSEK ? UserRole.KEPSEK : UserRole.GURU;

                var user = new User
                {
                    Username = dto.Username,
                    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = role,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                createdUserId = user.Id;
            }

            var teacher = new Teacher
            {
                UserId = createdUserId,
                Nip = dto.Nip,
                FullName = dto.FullName,
                Gender = dto.Gender,
                Position = dto.Position,
                SignaturePath = dto.SignaturePath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Teachers.Add(teacher);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = teacher.Id }, teacher);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherDto dto)
        {
            var entity = await _context.Teachers.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Nip = dto.Nip;
            entity.FullName = dto.FullName;
            entity.Gender = dto.Gender;
            entity.Position = dto.Position;
            entity.SignaturePath = dto.SignaturePath;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(entity);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Teachers.FindAsync(id);
            if (entity == null) return NotFound();

            // Validate soft delete constraints
            await _context.ValidateSoftDeleteAsync<Teacher>(id);

            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Data guru berhasil dihapus (soft delete)." });
        }
    }
}

