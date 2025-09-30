import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ElementTesting from "./pages/elementTesting";
import PagesTesting from "./pages/pagesTesting";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
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
        <Route
          path="/elementTesting"
          element={
            <ProtectedRoute>
              <ElementTesting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pagesTesting"
          element={
            <ProtectedRoute>
              <PagesTesting />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
