using SekolahApi.Models.Enums;
using System;

namespace SekolahApi.Models.DTOs.Students
{
    public class StudentDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string Nisn { get; set; } = string.Empty;
        public string Nis { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public string BirthPlace { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public StudentStatus Status { get; set; }
        public string? CurrentClassName { get; set; }
        public int? CurrentClassId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateStudentDto
    {
        public string Nisn { get; set; } = string.Empty;
        public string Nis { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public string BirthPlace { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public StudentStatus Status { get; set; } = StudentStatus.AKTIF;
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateStudentDto
    {
        public string Nisn { get; set; } = string.Empty;
        public string Nis { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public string BirthPlace { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public StudentStatus Status { get; set; }
    }
}

