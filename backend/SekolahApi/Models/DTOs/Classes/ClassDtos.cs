using System;
using System.Collections.Generic;

namespace SekolahApi.Models.DTOs.Classes
{
    public class ClassDto
    {
        public int Id { get; set; }
        public int AcademicYearId { get; set; }
        public string AcademicYearName { get; set; } = string.Empty;
        public int HomeroomTeacherId { get; set; }
        public string HomeroomTeacherName { get; set; } = string.Empty;
        public int GradeLevel { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateClassDto
    {
        public int AcademicYearId { get; set; }
        public int HomeroomTeacherId { get; set; }
        public int GradeLevel { get; set; }
        public string ClassName { get; set; } = string.Empty;
    }

    public class UpdateClassDto
    {
        public int AcademicYearId { get; set; }
        public int HomeroomTeacherId { get; set; }
        public int GradeLevel { get; set; }
        public string ClassName { get; set; } = string.Empty;
    }

    public class ClassStudentDto
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public int StudentId { get; set; }
        public string StudentNisn { get; set; } = string.Empty;
        public string StudentNis { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
    }

    public class AssignStudentDto
    {
        public int ClassId { get; set; }
        public int StudentId { get; set; }
    }

    public class SubjectTeacherDto
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int GradeLevel { get; set; }
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal SubjectKkm { get; set; }
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
    }

    public class AssignSubjectTeacherDto
    {
        public int ClassId { get; set; }
        public int SubjectId { get; set; }
        public int TeacherId { get; set; }
    }
}

