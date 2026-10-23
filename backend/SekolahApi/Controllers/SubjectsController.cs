using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SekolahApi.Data;
using SekolahApi.Helpers;
using SekolahApi.Models.DTOs.Subjects;
using SekolahApi.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/subjects")]
    [Authorize]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var query = _context.Subjects.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.Name.Contains(search) || s.Code.Contains(search));
            }

            var result = await query
                .OrderBy(s => s.Code)
                .ToPagedListAsync(page, pageSize, s => new SubjectDto
                {
                    Id = s.Id,
                    Code = s.Code,
                    Name = s.Name,
                    Kkm = s.Kkm,
                    CreatedAt = s.CreatedAt
                });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var s = await _context.Subjects
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (s == null) return NotFound();

            return Ok(new SubjectDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Kkm = s.Kkm,
                CreatedAt = s.CreatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateSubjectDto dto)
        {
            var exists = await _context.Subjects.AnyAsync(s => s.Code == dto.Code);
            if (exists) return BadRequest(new { message = "Kode mata pelajaran sudah digunakan." });

            var entity = new Subject
            {
                Code = dto.Code,
                Name = dto.Name,
                Kkm = 75.00m, // PRD Standard KKM: 75
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Subjects.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSubjectDto dto)
        {
            var entity = await _context.Subjects.FindAsync(id);
            if (entity == null) return NotFound();

            var codeExists = await _context.Subjects.AnyAsync(s => s.Code == dto.Code && s.Id != id);
            if (codeExists) return BadRequest(new { message = "Kode mata pelajaran sudah digunakan." });

            entity.Code = dto.Code;
            entity.Name = dto.Name;
            entity.Kkm = 75.00m; // Keep standard KKM 75
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(entity);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Subjects.FindAsync(id);
            if (entity == null) return NotFound();

            // Validate soft delete constraints
            await _context.ValidateSoftDeleteAsync<Subject>(id);

            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mata pelajaran berhasil dihapus (soft delete)." });
        }
    }
}

