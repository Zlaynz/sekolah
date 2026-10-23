using SekolahApi.Models.Enums;
using System;

namespace SekolahApi.Models.DTOs.AcademicYears
{
    public class AcademicYearDto
    {
        public int Id { get; set; }
        public string YearName { get; set; } = string.Empty;
        public Semester Semester { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ClassCount { get; set; }
    }

    public class CreateAcademicYearDto
    {
        public string YearName { get; set; } = string.Empty;
        public Semester Semester { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
    }

    public class UpdateAcademicYearDto
    {
        public string YearName { get; set; } = string.Empty;
        public Semester Semester { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
    }
}

