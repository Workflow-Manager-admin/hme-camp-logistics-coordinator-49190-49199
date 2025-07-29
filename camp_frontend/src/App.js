import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarNav from "./components/SidebarNav";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Accommodations from "./pages/Accommodations";
import Jobs from "./pages/Jobs";
import Meals from "./pages/Meals";
import Payments from "./pages/Payments";
import Roster from "./pages/Roster";
import AdminInviteManager from "./components/AdminInviteManager";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardLayout>
          <SidebarNav />
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="/accommodations" element={<PrivateRoute><Accommodations /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/meals" element={<PrivateRoute><Meals /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
            <Route path="/roster" element={<PrivateRoute><Roster /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminInviteManager /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </DashboardLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
