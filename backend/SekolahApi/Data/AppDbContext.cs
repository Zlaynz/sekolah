using Microsoft.EntityFrameworkCore;
using SekolahApi.Models.Entities;
using SekolahApi.Models.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SekolahApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
        public DbSet<Teacher> Teachers => Set<Teacher>();
        public DbSet<Student> Students => Set<Student>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<Class> Classes => Set<Class>();
        public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
        public DbSet<SubjectTeacher> SubjectTeachers => Set<SubjectTeacher>();
        public DbSet<Attendance> Attendances => Set<Attendance>();
        public DbSet<DailyGrade> DailyGrades => Set<DailyGrade>();
        public DbSet<ExamGrade> ExamGrades => Set<ExamGrade>();
        public DbSet<GraduationExam> GraduationExams => Set<GraduationExam>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Table Names
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<AcademicYear>().ToTable("academic_years");
            modelBuilder.Entity<Teacher>().ToTable("teachers");
            modelBuilder.Entity<Student>().ToTable("students");
            modelBuilder.Entity<Subject>().ToTable("subjects");
            modelBuilder.Entity<Class>().ToTable("classes");
            modelBuilder.Entity<ClassStudent>().ToTable("class_students");
            modelBuilder.Entity<SubjectTeacher>().ToTable("subject_teachers");
            modelBuilder.Entity<Attendance>().ToTable("attendances");
            modelBuilder.Entity<DailyGrade>().ToTable("daily_grades");
            modelBuilder.Entity<ExamGrade>().ToTable("exam_grades");
            modelBuilder.Entity<GraduationExam>().ToTable("graduation_exams");

            // Enum Conversions
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<AcademicYear>()
                .Property(a => a.Semester)
                .HasConversion<string>();

            modelBuilder.Entity<Teacher>()
                .Property(t => t.Gender)
                .HasConversion<string>();

            modelBuilder.Entity<Teacher>()
                .Property(t => t.Position)
                .HasConversion<string>();

            modelBuilder.Entity<Student>()
                .Property(s => s.Gender)
                .HasConversion<string>();

            modelBuilder.Entity<Student>()
                .Property(s => s.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Attendance>()
                .Property(a => a.Status)
                .HasConversion<string>();

            modelBuilder.Entity<ExamGrade>()
                .Property(e => e.ExamType)
                .HasConversion<string>();

            // Decimal Precision
            modelBuilder.Entity<Subject>()
                .Property(s => s.Kkm)
                .HasPrecision(5, 2);

            modelBuilder.Entity<DailyGrade>()
                .Property(d => d.Score)
                .HasPrecision(5, 2);

            modelBuilder.Entity<ExamGrade>()
                .Property(e => e.Score)
                .HasPrecision(5, 2);

            modelBuilder.Entity<GraduationExam>()
                .Property(g => g.WrittenScore)
                .HasPrecision(5, 2);

            modelBuilder.Entity<GraduationExam>()
                .Property(g => g.PracticalScore)
                .HasPrecision(5, 2);

            modelBuilder.Entity<GraduationExam>()
                .Property(g => g.FinalScore)
                .HasPrecision(5, 2);

            // Indexes and Constraints for Query Optimizing & Referential Integrity
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Teacher>()
                .HasIndex(t => t.Nip)
                .IsUnique();

            modelBuilder.Entity<Teacher>()
                .HasIndex(t => t.FullName);

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.Nisn)
                .IsUnique();

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.Nis)
                .IsUnique();

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.FullName);

            modelBuilder.Entity<Subject>()
                .HasIndex(s => s.Code)
                .IsUnique();

            modelBuilder.Entity<Class>()
                .HasIndex(c => new { c.AcademicYearId, c.ClassName });

            modelBuilder.Entity<ClassStudent>()
                .HasIndex(cs => new { cs.ClassId, cs.StudentId });

            modelBuilder.Entity<SubjectTeacher>()
                .HasIndex(st => new { st.ClassId, st.SubjectId, st.TeacherId });

            modelBuilder.Entity<DailyGrade>()
                .HasIndex(dg => new { dg.SubjectTeacherId, dg.StudentId });

            modelBuilder.Entity<ExamGrade>()
                .HasIndex(eg => new { eg.SubjectTeacherId, eg.StudentId, eg.ExamType });

            modelBuilder.Entity<Attendance>()
                .HasIndex(a => new { a.SubjectTeacherId, a.Date });

            modelBuilder.Entity<GraduationExam>()
                .HasIndex(ge => new { ge.AcademicYearId, ge.StudentId, ge.SubjectId });

            // Relationships
            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.User)
                .WithOne(u => u.Teacher)
                .HasForeignKey<Teacher>(t => t.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Class>()
                .HasOne(c => c.HomeroomTeacher)
                .WithMany(t => t.HomeroomClasses)
                .HasForeignKey(c => c.HomeroomTeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Class>()
                .HasOne(c => c.AcademicYear)
                .WithMany(ay => ay.Classes)
                .HasForeignKey(c => c.AcademicYearId)
                .OnDelete(DeleteBehavior.Restrict);

            // Global Query Filters for Soft Delete
            modelBuilder.Entity<User>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<AcademicYear>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<Teacher>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<Student>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<Subject>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<Class>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<ClassStudent>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<SubjectTeacher>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<Attendance>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<DailyGrade>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<ExamGrade>().HasQueryFilter(e => e.DeletedAt == null);
            modelBuilder.Entity<GraduationExam>().HasQueryFilter(e => e.DeletedAt == null);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }

        /// <summary>
        /// Validates referential constraints before soft deleting per Section 4 of PRD.
        /// Throws ReferentialConstraintException (HTTP 422) if active children are found.
        /// </summary>
        public async Task ValidateSoftDeleteAsync<T>(int id) where T : BaseEntity
        {
            if (typeof(T) == typeof(Student))
            {
                var hasClassStudents = await ClassStudents.AnyAsync(cs => cs.StudentId == id);
                var hasAttendances = await Attendances.AnyAsync(a => a.StudentId == id);
                var hasDailyGrades = await DailyGrades.AnyAsync(dg => dg.StudentId == id);
                var hasExamGrades = await ExamGrades.AnyAsync(eg => eg.StudentId == id);
                var hasGradExams = await GraduationExams.AnyAsync(ge => ge.StudentId == id);

                if (hasClassStudents || hasAttendances || hasDailyGrades || hasExamGrades || hasGradExams)
                {
                    throw new ReferentialConstraintException(
                        "Data siswa tidak dapat dihapus karena memiliki riwayat kelas, presensi, atau nilai aktif.",
                        "students",
                        hasClassStudents ? "class_students" : hasAttendances ? "attendances" : "grades"
                    );
                }
            }
            else if (typeof(T) == typeof(Teacher))
            {
                var isHomeroom = await Classes.AnyAsync(c => c.HomeroomTeacherId == id);
                var hasSubjectAssignments = await SubjectTeachers.AnyAsync(st => st.TeacherId == id);

                if (isHomeroom || hasSubjectAssignments)
                {
                    throw new ReferentialConstraintException(
                        "Data guru tidak dapat dihapus karena masih terdaftar sebagai wali kelas atau pengampu mata pelajaran aktif.",
                        "teachers",
                        isHomeroom ? "classes (Wali Kelas)" : "subject_teachers"
                    );
                }
            }
            else if (typeof(T) == typeof(Subject))
            {
                var hasAssignments = await SubjectTeachers.AnyAsync(st => st.SubjectId == id);
                var hasGradExams = await GraduationExams.AnyAsync(ge => ge.SubjectId == id);

                if (hasAssignments || hasGradExams)
                {
                    throw new ReferentialConstraintException(
                        "Mata pelajaran tidak dapat dihapus karena masih digunakan pada penugasan pengampu/ujian.",
                        "subjects",
                        hasAssignments ? "subject_teachers" : "graduation_exams"
                    );
                }
            }
            else if (typeof(T) == typeof(Class))
            {
                var hasStudents = await ClassStudents.AnyAsync(cs => cs.ClassId == id);
                var hasSubjects = await SubjectTeachers.AnyAsync(st => st.ClassId == id);

                if (hasStudents || hasSubjects)
                {
                    throw new ReferentialConstraintException(
                        "Kelas tidak dapat dihapus karena masih memiliki daftar siswa atau penugasan mapel aktif.",
                        "classes",
                        hasStudents ? "class_students" : "subject_teachers"
                    );
                }
            }
            else if (typeof(T) == typeof(AcademicYear))
            {
                var hasClasses = await Classes.AnyAsync(c => c.AcademicYearId == id);
                var hasGradExams = await GraduationExams.AnyAsync(ge => ge.AcademicYearId == id);

                if (hasClasses || hasGradExams)
                {
                    throw new ReferentialConstraintException(
                        "Tahun ajaran tidak dapat dihapus karena memiliki data kelas atau ujian kelulusan aktif.",
                        "academic_years",
                        hasClasses ? "classes" : "graduation_exams"
                    );
                }
            }
        }
    }
}

