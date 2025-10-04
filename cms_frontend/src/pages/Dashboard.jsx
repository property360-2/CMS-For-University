import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch pages
  const { data, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await API.get("pages/");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <Link to="/pages" className="text-blue-500 mb-4 inline-block">
        Go to Pages
      </Link>

      <ul>
        {data.map((page) => (
          <li key={page.id}>{page.title}</li>
        ))}
      </ul>
    </div>
  );
}
