using Microsoft.EntityFrameworkCore;
using SekolahApi.Models.Entities;
using SekolahApi.Models.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SekolahApi.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            if (await context.Users.AnyAsync())
            {
                return; // Already seeded
            }

            // 1. Admin User
            var adminUser = new User
            {
                Username = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.ADMIN,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);

            // 2. Academic Year
            var academicYear = new AcademicYear
            {
                YearName = "2025/2026",
                Semester = Semester.GANJIL,
                IsActive = true,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.AcademicYears.Add(academicYear);
            await context.SaveChangesAsync();

            // 3. Teachers & Pejabat
            var guru1User = new User
            {
                Username = "guru1",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = UserRole.GURU,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(guru1User);

            var guru2User = new User
            {
                Username = "guru2",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = UserRole.WALIKELAS,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(guru2User);

            var wakasekUser = new User
            {
                Username = "wakasek",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = UserRole.WAKASEK,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(wakasekUser);

            var kepsekUser = new User
            {
                Username = "kepsek",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = UserRole.KEPSEK,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(kepsekUser);
            await context.SaveChangesAsync();

            var teacher1 = new Teacher
            {
                UserId = guru1User.Id,
                Nip = "198001012005011001",
                FullName = "Drs. Budi Santoso, M.Pd",
                Gender = Gender.L,
                Position = TeacherPosition.GURU,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Teachers.Add(teacher1);

            var teacher2 = new Teacher
            {
                UserId = guru2User.Id,
                Nip = "198202022006022002",
                FullName = "Siti Aminah, S.Pd",
                Gender = Gender.P,
                Position = TeacherPosition.GURU,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Teachers.Add(teacher2);

            var teacherWakasek = new Teacher
            {
                UserId = wakasekUser.Id,
                Nip = "197503031998031003",
                FullName = "Hendra Wijaya, S.Pd, M.M",
                Gender = Gender.L,
                Position = TeacherPosition.WAKASEK,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Teachers.Add(teacherWakasek);

            var teacherKepsek = new Teacher
            {
                UserId = kepsekUser.Id,
                Nip = "196804041990042004",
                FullName = "Dra. Hj. Nurhayati, M.Pd",
                Gender = Gender.P,
                Position = TeacherPosition.KEPSEK,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Teachers.Add(teacherKepsek);
            await context.SaveChangesAsync();

            // 4. Subjects
            var subMat7 = new Subject { Code = "MAT-7", Name = "Matematika 7", Kkm = 75.00m };
            var subBin7 = new Subject { Code = "BIN-7", Name = "Bahasa Indonesia 7", Kkm = 75.00m };
            var subIpa7 = new Subject { Code = "IPA-7", Name = "Ilmu Pengetahuan Alam 7", Kkm = 75.00m };
            var subBig7 = new Subject { Code = "BIG-7", Name = "Bahasa Inggris 7", Kkm = 75.00m };
            var subMat9 = new Subject { Code = "MAT-9", Name = "Matematika 9", Kkm = 75.00m };
            var subIpa9 = new Subject { Code = "IPA-9", Name = "IPA Terpadu 9", Kkm = 75.00m };

            context.Subjects.AddRange(subMat7, subBin7, subIpa7, subBig7, subMat9, subIpa9);
            await context.SaveChangesAsync();

            // 5. Classes
            var class7A = new Class
            {
                AcademicYearId = academicYear.Id,
                HomeroomTeacherId = teacher1.Id,
                GradeLevel = 7,
                ClassName = "7-A",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var class9A = new Class
            {
                AcademicYearId = academicYear.Id,
                HomeroomTeacherId = teacher2.Id,
                GradeLevel = 9,
                ClassName = "9-A",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Classes.AddRange(class7A, class9A);
            await context.SaveChangesAsync();

            // 6. Students
            var siswa1User = new User
            {
                Username = "siswa1",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = UserRole.SISWA,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var siswa2User = new User
            {
                Username = "siswa2",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = UserRole.SISWA,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.AddRange(siswa1User, siswa2User);
            await context.SaveChangesAsync();

            var student1 = new Student
            {
                UserId = siswa1User.Id,
                Nisn = "0081234561",
                Nis = "232407001",
                FullName = "Ahmad Dani Pratama",
                Gender = Gender.L,
                BirthPlace = "Jakarta",
                BirthDate = new DateTime(2011, 4, 15),
                Status = StudentStatus.AKTIF
            };

            var student2 = new Student
            {
                UserId = null,
                Nisn = "0081234562",
                Nis = "232407002",
                FullName = "Siti Rahmawati",
                Gender = Gender.P,
                BirthPlace = "Bandung",
                BirthDate = new DateTime(2011, 6, 20),
                Status = StudentStatus.AKTIF
            };

            var student9 = new Student
            {
                UserId = siswa2User.Id,
                Nisn = "0061234563",
                Nis = "212209001",
                FullName = "Rizky Ramadhan",
                Gender = Gender.L,
                BirthPlace = "Surabaya",
                BirthDate = new DateTime(2009, 8, 10),
                Status = StudentStatus.AKTIF
            };
            context.Students.AddRange(student1, student2, student9);
            await context.SaveChangesAsync();

            // 7. Class Students
            context.ClassStudents.AddRange(
                new ClassStudent { ClassId = class7A.Id, StudentId = student1.Id },
                new ClassStudent { ClassId = class7A.Id, StudentId = student2.Id },
                new ClassStudent { ClassId = class9A.Id, StudentId = student9.Id }
            );
            await context.SaveChangesAsync();

            // 8. Subject Teachers
            var st1 = new SubjectTeacher { ClassId = class7A.Id, SubjectId = subMat7.Id, TeacherId = teacher1.Id };
            var st2 = new SubjectTeacher { ClassId = class7A.Id, SubjectId = subBin7.Id, TeacherId = teacher2.Id };
            var st3 = new SubjectTeacher { ClassId = class9A.Id, SubjectId = subMat9.Id, TeacherId = teacher1.Id };
            context.SubjectTeachers.AddRange(st1, st2, st3);
            await context.SaveChangesAsync();

            // 9. Sample Grades & Attendances for Student 1
            context.DailyGrades.AddRange(
                new DailyGrade { SubjectTeacherId = st1.Id, StudentId = student1.Id, TaskTitle = "Tugas 1: Aljabar", Score = 85.00m },
                new DailyGrade { SubjectTeacherId = st1.Id, StudentId = student1.Id, TaskTitle = "Tugas 2: Persamaan Linear", Score = 72.00m }, // Below KKM
                new DailyGrade { SubjectTeacherId = st1.Id, StudentId = student2.Id, TaskTitle = "Tugas 1: Aljabar", Score = 90.00m }
            );

            context.ExamGrades.AddRange(
                new ExamGrade { SubjectTeacherId = st1.Id, StudentId = student1.Id, ExamType = ExamType.UTS, Score = 80.00m },
                new ExamGrade { SubjectTeacherId = st1.Id, StudentId = student1.Id, ExamType = ExamType.UAS, Score = 78.00m },
                new ExamGrade { SubjectTeacherId = st1.Id, StudentId = student2.Id, ExamType = ExamType.UTS, Score = 88.00m },
                new ExamGrade { SubjectTeacherId = st1.Id, StudentId = student2.Id, ExamType = ExamType.UAS, Score = 92.00m }
            );

            context.Attendances.AddRange(
                new Attendance { SubjectTeacherId = st1.Id, StudentId = student1.Id, Date = DateTime.UtcNow.Date.AddDays(-2), Status = AttendanceStatus.HADIR },
                new Attendance { SubjectTeacherId = st1.Id, StudentId = student1.Id, Date = DateTime.UtcNow.Date.AddDays(-1), Status = AttendanceStatus.HADIR },
                new Attendance { SubjectTeacherId = st1.Id, StudentId = student2.Id, Date = DateTime.UtcNow.Date.AddDays(-2), Status = AttendanceStatus.IZIN, Notes = "Acara keluarga" },
                new Attendance { SubjectTeacherId = st1.Id, StudentId = student2.Id, Date = DateTime.UtcNow.Date.AddDays(-1), Status = AttendanceStatus.HADIR }
            );

            // 10. Sample Graduation Exam for Grade 9 Student
            context.GraduationExams.Add(new GraduationExam
            {
                AcademicYearId = academicYear.Id,
                StudentId = student9.Id,
                SubjectId = subMat9.Id,
                WrittenScore = 82.00m,
                PracticalScore = 88.00m,
                FinalScore = 85.00m
            });

            await context.SaveChangesAsync();
        }
    }
}

