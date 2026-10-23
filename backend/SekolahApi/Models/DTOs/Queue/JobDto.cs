using System;

namespace SekolahApi.Models.DTOs.Queue
{
    public enum JobStatus
    {
        Queued,
        Processing,
        Completed,
        Failed
    }

    public class JobDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public JobStatus Status { get; set; } = JobStatus.Queued;
        public int Progress { get; set; } = 0;
        public string? ResultUrl { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public object? Metadata { get; set; }
    }

    public class QueueReportRequestDto
    {
        public string ReportType { get; set; } = "STUDENT_REPORT_CARD";
        public int? TargetId { get; set; }
        public int? AcademicYearId { get; set; }
    }
}

