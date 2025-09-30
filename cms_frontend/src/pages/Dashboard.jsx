import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Logout
      </button>

      <div className="space-y-2">
        <Link
          to="/elementTesting"
          className="block bg-blue-500 text-white px-4 py-2 rounded"
        >
          Element Testing
        </Link>
        <Link
          to="/pagesTesting"
          className="block bg-green-500 text-white px-4 py-2 rounded"
        >
          Pages Testing
        </Link>
      </div>
    </div>
  );
}
