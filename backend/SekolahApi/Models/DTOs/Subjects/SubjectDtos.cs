using System;

namespace SekolahApi.Models.DTOs.Subjects
{
    public class SubjectDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Kkm { get; set; } = 75.00m;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSubjectDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Kkm { get; set; } = 75.00m;
    }

    public class UpdateSubjectDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Kkm { get; set; } = 75.00m;
    }
}

