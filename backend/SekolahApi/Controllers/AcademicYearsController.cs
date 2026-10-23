using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.DTOs.AcademicYears;
using SekolahApi.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/academic-years")]
    [Authorize]
    public class AcademicYearsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AcademicYearsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var query = _context.AcademicYears.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(a => a.YearName.Contains(search));
            }

            var result = await query
                .OrderByDescending(a => a.IsActive)
                .ThenByDescending(a => a.YearName)
                .ToPagedListAsync(page, pageSize, a => new AcademicYearDto
                {
                    Id = a.Id,
                    YearName = a.YearName,
                    Semester = a.Semester,
                    IsActive = a.IsActive,
                    IsLocked = a.IsLocked,
                    CreatedAt = a.CreatedAt,
                    ClassCount = a.Classes.Count()
                });

            return Ok(result);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var active = await _context.AcademicYears
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.IsActive);

            if (active == null) return NotFound(new { message = "Tidak ada tahun ajaran aktif." });

            return Ok(new AcademicYearDto
            {
                Id = active.Id,
                YearName = active.YearName,
                Semester = active.Semester,
                IsActive = active.IsActive,
                IsLocked = active.IsLocked,
                CreatedAt = active.CreatedAt
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.AcademicYears
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (item == null) return NotFound();

            return Ok(new AcademicYearDto
            {
                Id = item.Id,
                YearName = item.YearName,
                Semester = item.Semester,
                IsActive = item.IsActive,
                IsLocked = item.IsLocked,
                CreatedAt = item.CreatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateAcademicYearDto dto)
        {
            if (dto.IsActive)
            {
                var currentActives = await _context.AcademicYears.Where(a => a.IsActive).ToListAsync();
                foreach (var cur in currentActives) cur.IsActive = false;
            }

            var entity = new AcademicYear
            {
                YearName = dto.YearName,
                Semester = dto.Semester,
                IsActive = dto.IsActive,
                IsLocked = dto.IsLocked,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AcademicYears.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAcademicYearDto dto)
        {
            var entity = await _context.AcademicYears.FindAsync(id);
            if (entity == null) return NotFound();

            if (dto.IsActive && !entity.IsActive)
            {
                var currentActives = await _context.AcademicYears.Where(a => a.IsActive && a.Id != id).ToListAsync();
                foreach (var cur in currentActives) cur.IsActive = false;
            }

            entity.YearName = dto.YearName;
            entity.Semester = dto.Semester;
            entity.IsActive = dto.IsActive;
            entity.IsLocked = dto.IsLocked;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(entity);
        }

        [HttpPatch("{id}/toggle-lock")]
        [Authorize(Roles = "ADMIN,WAKASEK")]
        public async Task<IActionResult> ToggleLock(int id)
        {
            var entity = await _context.AcademicYears.FindAsync(id);
            if (entity == null) return NotFound();

            entity.IsLocked = !entity.IsLocked;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Status kuncian nilai tahun ajaran diubah menjadi {(entity.IsLocked ? "Terkunci" : "Terbuka")}", isLocked = entity.IsLocked });
        }

        [HttpPatch("{id}/set-active")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> SetActive(int id)
        {
            var entity = await _context.AcademicYears.FindAsync(id);
            if (entity == null) return NotFound();

            var currentActives = await _context.AcademicYears.Where(a => a.IsActive).ToListAsync();
            foreach (var cur in currentActives) cur.IsActive = false;

            entity.IsActive = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Tahun ajaran {entity.YearName} ({entity.Semester}) sekarang berstatus Aktif." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.AcademicYears.FindAsync(id);
            if (entity == null) return NotFound();

            // Validate referential constraints
            await _context.ValidateSoftDeleteAsync<AcademicYear>(id);

            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tahun ajaran berhasil dihapus (soft delete)." });
        }
    }
}

