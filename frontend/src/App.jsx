import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Exams from "./pages/Exams";
import Results from "./pages/Results";
import Notices from "./pages/Notices";
import AcademicSessions from "./pages/AcademicSessions";
import Reports from "./pages/Reports";
import AdminProfile from "./pages/AdminProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/students"
              element={<Students />}
            />

            <Route
              path="/teachers"
              element={<Teachers />}
            />

            <Route
              path="/classes"
              element={<Classes />}
            />

            <Route
              path="/subjects"
              element={<Subjects />}
            />

            <Route
              path="/timetable"
              element={<Timetable />}
            />

            <Route
              path="/attendance"
              element={<Attendance />}
            />

            <Route
              path="/fees"
              element={<Fees />}
            />

            <Route
              path="/exams"
              element={<Exams />}
            />

            <Route
              path="/results"
              element={<Results />}
            />

            <Route
              path="/notices"
              element={<Notices />}
            />

            <Route
              path="/academic-sessions"
              element={<AcademicSessions />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/profile"
              element={<AdminProfile />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;