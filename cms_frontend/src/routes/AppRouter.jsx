import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ElementTesting from "../pages/ElementTesting";
import PagesTesting from "../pages/PagesTesting";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
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

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
