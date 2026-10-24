using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.DTOs.Students;
using SekolahApi.Models.Entities;
using SekolahApi.Models.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/students")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public StudentsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? classId = null,
            [FromQuery] StudentStatus? status = null)
        {
            var query = _context.Students
                .Include(s => s.User)
                .Include(s => s.ClassStudents)
                    .ThenInclude(cs => cs.Class)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.FullName.Contains(search) || s.Nisn.Contains(search) || s.Nis.Contains(search));
            }

            if (classId.HasValue)
            {
                query = query.Where(s => s.ClassStudents.Any(cs => cs.ClassId == classId.Value));
            }

            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }

            var result = await query
                .OrderBy(s => s.FullName)
                .ToPagedListAsync(page, pageSize, s => new StudentDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    Username = s.User != null ? s.User.Username : null,
                    Nisn = s.Nisn,
                    Nis = s.Nis,
                    FullName = s.FullName,
                    Gender = s.Gender,
                    BirthPlace = s.BirthPlace,
                    BirthDate = s.BirthDate,
                    Status = s.Status,
                    CurrentClassName = s.ClassStudents.Select(cs => cs.Class.ClassName).FirstOrDefault(),
                    CurrentClassId = s.ClassStudents.Select(cs => cs.ClassId).FirstOrDefault(),
                    PhotoPath = s.User != null ? s.User.PhotoPath : null,
                    CreatedAt = s.CreatedAt
                });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var s = await _context.Students
                .Include(x => x.User)
                .Include(x => x.ClassStudents)
                    .ThenInclude(cs => cs.Class)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (s == null) return NotFound();

            return Ok(new StudentDto
            {
                Id = s.Id,
                UserId = s.UserId,
                Username = s.User?.Username,
                Nisn = s.Nisn,
                Nis = s.Nis,
                FullName = s.FullName,
                Gender = s.Gender,
                BirthPlace = s.BirthPlace,
                BirthDate = s.BirthDate,
                Status = s.Status,
                CurrentClassName = s.ClassStudents.Select(cs => cs.Class.ClassName).FirstOrDefault(),
                CurrentClassId = s.ClassStudents.Select(cs => cs.ClassId).FirstOrDefault(),
                PhotoPath = s.User?.PhotoPath,
                CreatedAt = s.CreatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateStudentDto dto)
        {
            var nisnExists = await _context.Students.AnyAsync(s => s.Nisn == dto.Nisn);
            if (nisnExists) return BadRequest(new { message = "NISN sudah terdaftar." });

            var nisExists = await _context.Students.AnyAsync(s => s.Nis == dto.Nis);
            if (nisExists) return BadRequest(new { message = "NIS sudah terdaftar." });

            int? createdUserId = null;
            if (!string.IsNullOrWhiteSpace(dto.Username) && !string.IsNullOrWhiteSpace(dto.Password))
            {
                var userExists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
                if (userExists) return BadRequest(new { message = "Username sudah digunakan." });

                var user = new User
                {
                    Username = dto.Username,
                    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = UserRole.SISWA,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                createdUserId = user.Id;
            }

            var student = new Student
            {
                UserId = createdUserId,
                Nisn = dto.Nisn,
                Nis = dto.Nis,
                FullName = dto.FullName,
                Gender = dto.Gender,
                BirthPlace = dto.BirthPlace,
                BirthDate = dto.BirthDate,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentDto dto)
        {
            var entity = await _context.Students.FindAsync(id);
            if (entity == null) return NotFound();

            var nisnExists = await _context.Students.AnyAsync(s => s.Nisn == dto.Nisn && s.Id != id);
            if (nisnExists) return BadRequest(new { message = "NISN sudah digunakan oleh siswa lain." });

            var nisExists = await _context.Students.AnyAsync(s => s.Nis == dto.Nis && s.Id != id);
            if (nisExists) return BadRequest(new { message = "NIS sudah digunakan oleh siswa lain." });

            entity.Nisn = dto.Nisn;
            entity.Nis = dto.Nis;
            entity.FullName = dto.FullName;
            entity.Gender = dto.Gender;
            entity.BirthPlace = dto.BirthPlace;
            entity.BirthDate = dto.BirthDate;
            entity.Status = dto.Status;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(entity);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Students.FindAsync(id);
            if (entity == null) return NotFound();

            // Validate soft delete constraints
            await _context.ValidateSoftDeleteAsync<Student>(id);

            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Data siswa berhasil dihapus (soft delete)." });
        }

        [HttpPost("{id}/photo")]
        public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
        {
            var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound(new { message = "Siswa tidak ditemukan." });

            var studentIdClaim = User.FindFirst("StudentId")?.Value;
            if (!User.IsInRole("ADMIN") && studentIdClaim != id.ToString())
            {
                return Forbid();
            }

            if (student.User == null)
            {
                return BadRequest(new { message = "Siswa belum memiliki akun pengguna tertaut." });
            }

            var (success, filePath, errorMessage) = await FileUploadHelper.SavePhotoAsync(file, _env, "photos");
            if (!success)
            {
                return BadRequest(new { message = errorMessage });
            }

            FileUploadHelper.DeleteFile(student.User.PhotoPath, _env);
            student.User.PhotoPath = filePath;
            student.User.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Foto siswa berhasil diunggah.", photoPath = filePath });
        }

        [HttpDelete("{id}/photo")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound(new { message = "Siswa tidak ditemukan." });

            var studentIdClaim = User.FindFirst("StudentId")?.Value;
            if (!User.IsInRole("ADMIN") && studentIdClaim != id.ToString())
            {
                return Forbid();
            }

            if (student.User != null && !string.IsNullOrEmpty(student.User.PhotoPath))
            {
                FileUploadHelper.DeleteFile(student.User.PhotoPath, _env);
                student.User.PhotoPath = null;
                student.User.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Foto siswa berhasil dihapus." });
        }
    }
}
