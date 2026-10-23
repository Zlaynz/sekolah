import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard';

// Master Data
import UsersPage from './pages/admin/UsersPage';
import AcademicYearsPage from './pages/admin/AcademicYearsPage';
import TeachersPage from './pages/admin/TeachersPage';
import StudentsPage from './pages/admin/StudentsPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import ClassesPage from './pages/admin/ClassesPage';
import ClassStudentsPage from './pages/admin/ClassStudentsPage';
import SubjectTeachersPage from './pages/admin/SubjectTeachersPage';

// Teacher & Assessments
import AttendancePage from './pages/teacher/AttendancePage';
import DailyGradesPage from './pages/teacher/DailyGradesPage';
import ExamGradesPage from './pages/teacher/ExamGradesPage';
import GraduationExamsPage from './pages/teacher/GraduationExamsPage';

// Homeroom & Reports
import AttendanceRecapPage from './pages/homeroom/AttendanceRecapPage';
import ReportCardPage from './pages/homeroom/ReportCardPage';
import GraduationPage from './pages/vice-principal/GraduationPage';

// Student
import MyProfilePage from './pages/student/MyProfilePage';
import MyAttendancePage from './pages/student/MyAttendancePage';
import MyGradesPage from './pages/student/MyGradesPage';

// Search & Queue
import SearchResultsPage from './pages/search/SearchResultsPage';
import QueueJobsPage from './pages/queue/QueueJobsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, user, getDashboardPath } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={getDashboardPath(user?.role)} replace /> : <LoginPage />
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={getDashboardPath(user?.role)} replace />} />

        {/* Dashboards */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="homeroom/dashboard" element={<TeacherDashboard />} />
        <Route path="principal/dashboard" element={<PrincipalDashboard />} />
        <Route path="vice-principal/dashboard" element={<PrincipalDashboard />} />

        {/* Admin Master Data */}
        <Route path="admin/users" element={<UsersPage />} />
        <Route path="admin/academic-years" element={<AcademicYearsPage />} />
        <Route path="admin/teachers" element={<TeachersPage />} />
        <Route path="admin/students" element={<StudentsPage />} />
        <Route path="admin/subjects" element={<SubjectsPage />} />
        <Route path="admin/classes" element={<ClassesPage />} />
        <Route path="admin/class-students" element={<ClassStudentsPage />} />
        <Route path="admin/subject-teachers" element={<SubjectTeachersPage />} />

        {/* Teacher Academic Assessments */}
        <Route path="teacher/attendance" element={<AttendancePage />} />
        <Route path="teacher/daily-grades" element={<DailyGradesPage />} />
        <Route path="teacher/exam-grades" element={<ExamGradesPage />} />
        <Route path="teacher/graduation-exams" element={<GraduationExamsPage />} />

        {/* Homeroom & Curricular Recap */}
        <Route path="homeroom/attendance-recap" element={<AttendanceRecapPage />} />
        <Route path="homeroom/report-cards" element={<ReportCardPage />} />
        <Route path="vice-principal/graduation" element={<GraduationPage />} />

        {/* Student Views */}
        <Route path="student/profile" element={<MyProfilePage />} />
        <Route path="student/attendance" element={<MyAttendancePage />} />
        <Route path="student/grades" element={<MyGradesPage />} />

        {/* Common Features: Search Engine & Restful API Queue */}
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="queue/jobs" element={<QueueJobsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

