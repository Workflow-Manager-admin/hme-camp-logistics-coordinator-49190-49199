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

import { NotificationProvider, useNotification } from "./components/NotificationBar/NotificationBar";

// PUBLIC_INTERFACE
/**
 * Example button for triggering a notification.
 */
function NotificationExampleButton() {
  const notify = useNotification();
  return (
    <button
      onClick={() =>
        notify({
          message: "Example: Notification system now works!",
          type: "success"
        })
      }
      style={{
        margin: 16,
        padding: "8px 18px",
        background: "#FF6F00",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      Test Notification
    </button>
  );
}

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AuthProvider>
          <DashboardLayout>
            <SidebarNav />
            {/* Example notification trigger button (for demonstration). Remove or move in production. */}
            <NotificationExampleButton />
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
    </NotificationProvider>
  );
}

export default App;
