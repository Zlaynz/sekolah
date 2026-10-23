using SekolahApi.Models.Enums;
using System;

namespace SekolahApi.Models.DTOs.Teachers
{
    public class TeacherDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Nip { get; set; }
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public TeacherPosition Position { get; set; }
        public string? SignaturePath { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTeacherDto
    {
        public string? Nip { get; set; }
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public TeacherPosition Position { get; set; } = TeacherPosition.GURU;
        public string? SignaturePath { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateTeacherDto
    {
        public string? Nip { get; set; }
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public TeacherPosition Position { get; set; }
        public string? SignaturePath { get; set; }
    }
}

