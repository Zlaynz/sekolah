using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.DTOs.Classes;
using SekolahApi.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/classes")]
    [Authorize]
    public class ClassesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClassesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? academicYearId = null,
            [FromQuery] int? gradeLevel = null)
        {
            var query = _context.Classes
                .Include(c => c.AcademicYear)
                .Include(c => c.HomeroomTeacher)
                .Include(c => c.ClassStudents)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.ClassName.Contains(search) || c.HomeroomTeacher.FullName.Contains(search));
            }

            if (academicYearId.HasValue)
            {
                query = query.Where(c => c.AcademicYearId == academicYearId.Value);
            }

            if (gradeLevel.HasValue)
            {
                query = query.Where(c => c.GradeLevel == gradeLevel.Value);
            }

            var result = await query
                .OrderBy(c => c.GradeLevel)
                .ThenBy(c => c.ClassName)
                .ToPagedListAsync(page, pageSize, c => new ClassDto
                {
                    Id = c.Id,
                    AcademicYearId = c.AcademicYearId,
                    AcademicYearName = $"{c.AcademicYear.YearName} ({c.AcademicYear.Semester})",
                    HomeroomTeacherId = c.HomeroomTeacherId,
                    HomeroomTeacherName = c.HomeroomTeacher.FullName,
                    GradeLevel = c.GradeLevel,
                    ClassName = c.ClassName,
                    StudentCount = c.ClassStudents.Count(),
                    CreatedAt = c.CreatedAt
                });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _context.Classes
                .Include(x => x.AcademicYear)
                .Include(x => x.HomeroomTeacher)
                .Include(x => x.ClassStudents)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (c == null) return NotFound();

            return Ok(new ClassDto
            {
                Id = c.Id,
                AcademicYearId = c.AcademicYearId,
                AcademicYearName = $"{c.AcademicYear.YearName} ({c.AcademicYear.Semester})",
                HomeroomTeacherId = c.HomeroomTeacherId,
                HomeroomTeacherName = c.HomeroomTeacher.FullName,
                GradeLevel = c.GradeLevel,
                ClassName = c.ClassName,
                StudentCount = c.ClassStudents.Count(),
                CreatedAt = c.CreatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateClassDto dto)
        {
            if (dto.GradeLevel != 7 && dto.GradeLevel != 8 && dto.GradeLevel != 9)
            {
                return BadRequest(new { message = "Tingkat kelas harus 7, 8, atau 9." });
            }

            var exists = await _context.Classes.AnyAsync(c =>
                c.AcademicYearId == dto.AcademicYearId && c.ClassName == dto.ClassName);
            if (exists) return BadRequest(new { message = "Nama kelas sudah ada di tahun ajaran ini." });

            var entity = new Class
            {
                AcademicYearId = dto.AcademicYearId,
                HomeroomTeacherId = dto.HomeroomTeacherId,
                GradeLevel = dto.GradeLevel,
                ClassName = dto.ClassName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Classes.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateClassDto dto)
        {
            var entity = await _context.Classes.FindAsync(id);
            if (entity == null) return NotFound();

            if (dto.GradeLevel != 7 && dto.GradeLevel != 8 && dto.GradeLevel != 9)
            {
                return BadRequest(new { message = "Tingkat kelas harus 7, 8, atau 9." });
            }

            var exists = await _context.Classes.AnyAsync(c =>
                c.AcademicYearId == dto.AcademicYearId && c.ClassName == dto.ClassName && c.Id != id);
            if (exists) return BadRequest(new { message = "Nama kelas sudah ada di tahun ajaran ini." });

            entity.AcademicYearId = dto.AcademicYearId;
            entity.HomeroomTeacherId = dto.HomeroomTeacherId;
            entity.GradeLevel = dto.GradeLevel;
            entity.ClassName = dto.ClassName;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(entity);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Classes.FindAsync(id);
            if (entity == null) return NotFound();

            // Validate soft delete constraints
            await _context.ValidateSoftDeleteAsync<Class>(id);

            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kelas berhasil dihapus (soft delete)." });
        }
    }
}

