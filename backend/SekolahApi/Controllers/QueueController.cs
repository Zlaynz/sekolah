using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SekolahApi.Models.DTOs.Queue;
using SekolahApi.Services.Queue;
using System;
using System.Threading.Tasks;

namespace SekolahApi.Controllers
{
    [ApiController]
    [Route("api/queue")]
    [Authorize]
    public class QueueController : ControllerBase
    {
        private readonly IBackgroundJobQueue _jobQueue;

        public QueueController(IBackgroundJobQueue jobQueue)
        {
            _jobQueue = jobQueue;
        }

        [HttpPost("jobs")]
        public async Task<IActionResult> EnqueueJob([FromBody] QueueReportRequestDto request)
        {
            var job = new JobDto
            {
                Id = Guid.NewGuid().ToString("N"),
                Title = request.ReportType switch
                {
                    "CLASS_RECAP" => $"Kompilasi Rekapitulasi Nilai & Presensi Kelas #{request.TargetId}",
                    "GRADUATION" => $"Pemrosesan Hasil Kelulusan Tahun Ajaran #{request.AcademicYearId}",
                    _ => $"Generasi Dokumen Rapor Siswa #{request.TargetId}"
                },
                Type = request.ReportType,
                Status = JobStatus.Queued,
                Progress = 0,
                CreatedAt = DateTime.UtcNow,
                Metadata = request
            };

            await _jobQueue.EnqueueAsync(job);

            // Return 202 Accepted with location of job status
            return Accepted($"/api/queue/jobs/{job.Id}", job);
        }

        [HttpGet("jobs/{id}")]
        public IActionResult GetJobStatus(string id)
        {
            var job = _jobQueue.GetJob(id);
            if (job == null) return NotFound(new { message = "Antrean tugas tidak ditemukan." });

            return Ok(job);
        }

        [HttpGet("jobs")]
        public IActionResult GetAllJobs()
        {
            var jobs = _jobQueue.GetAllJobs();
            return Ok(jobs);
        }
    }
}

