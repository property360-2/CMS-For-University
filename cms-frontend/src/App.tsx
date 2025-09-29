// cms-frontend/src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
} from "react-router-dom";
import Login from "./pages/Login";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "./store";
import { logout } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import PageRenderer from "./renderers/PageRenderer";
import TestingRenderer from "./pages/testing-renderer";
import { JSX } from "react";
import "./index.css";
import API from "./api/axios";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const access_token = useSelector(
    (state: RootState) => state.auth.access_token
  );
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
        await API.post("token/logout/", { refresh: refresh_token });
      }
    } catch (err) {
      console.error("Error logging out from server", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">Protected area</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            aria-label="Go home"
          >
            Home
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            aria-label="Log out"
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <p className="mb-6">
          Welcome to your dashboard. Use the links below to preview pages.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/home-page"
            className="block px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 text-center"
          >
            Open Home Page
          </Link>

          <Link
            to="/test-page"
            className="block px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
          >
            Open Testing Page (d56b17f6-...)
          </Link>

          <Link
            to="/pages/cf39ec9f-8cbf-48f7-9418-8f21c8ce7657"
            className="block px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center"
          >
            Open Page by ID (example)
          </Link>

          <Link
            to="/pages/d56b17f6-d856-4876-9df6-340320c1e006"
            className="block px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
          >
            Open Test Page by ID (d56b17f6-...)
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * PageByRoute - wrapper to render PageRenderer with :id param
 */
function PageByRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className="p-8">Missing page id.</div>;
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded shadow">
        <PageRenderer id={id} />
      </div>
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

        {/* Home page hardcoded (keeps previous behavior) */}
        <Route
          path="/home-page"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto bg-white rounded shadow">
                  <PageRenderer id="cf39ec9f-8cbf-48f7-9418-8f21c8ce7657" />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Testing wrapper (the file you created) */}
        <Route
          path="/test-page"
          element={
            <ProtectedRoute>
              <TestingRenderer />
            </ProtectedRoute>
          }
        />

        {/* Generic page-by-id route (useful for previewing any page) */}
        <Route
          path="/pages/:id"
          element={
            <ProtectedRoute>
              <PageByRoute />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
