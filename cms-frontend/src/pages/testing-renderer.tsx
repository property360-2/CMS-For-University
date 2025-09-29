// cms-frontend/src/pages/testing-renderer.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import PageRenderer from "../renderers/PageRenderer";

const TEST_PAGE_ID = "d56b17f6-d856-4876-9df6-340320c1e006";

export default function TestingRenderer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Testing renderer</h1>
            <p className="text-sm text-gray-600">Rendering page ID: {TEST_PAGE_ID}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              aria-label="Go back"
            >
              ← Back
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* PageRenderer will fetch /api/pages/:id/ and render the page */}
        <div className="bg-white rounded shadow">
          <PageRenderer id={TEST_PAGE_ID} />
        </div>
      </div>
    </div>
  );
}
