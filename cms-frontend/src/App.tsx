import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "./store";
import { logout } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import API from './api/axios';
import { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const access_token = useSelector(
    (state: RootState) => state.auth.access_token
  );
  console.log("ProtectedRoute - access_token:", access_token); // debug log
  return access_token ? children : <Navigate to="/login" />;
}

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refresh_token = useSelector(
    (state: RootState) => state.auth.refresh_token
  );

  const handleLogout = async () => {
    try {
      if (refresh_token) {
        const res = await API.post("token/logout/", { refresh: refresh_token });
        console.log("Server logout response:", res.data);
      }
    } catch (err) {
      console.error("Error logging out from server", err);
    } finally {
      dispatch(logout());
      console.log("Logged out successfully"); // debug log
      navigate("/login");
    }
  };

  return (
    <div className="p-8">
      <h1>Dashboard (Protected)</h1>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
