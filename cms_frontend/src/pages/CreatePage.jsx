// cms_frontend/src/pages/CreatePage.jsx
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import API from "../api/axios";
import { useToast } from "../components/common/Toast";

export default function PageCreator() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    template: null,
    status: "draft",
    seo_description: "",
    seo_keywords: "",
  });

  // Fetch templates from API
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await API.get("templates/");
      return res.data;
    },
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (pageData) => {
      const res = await API.post("pages/", pageData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Page created successfully!");
      navigate(`/pages/edit/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Failed to create page");
    },
  });

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData({ ...formData, title, slug });
  };

  const handleTemplateSelect = (template) => {
    setFormData({ ...formData, template: template.id });
  };

  const handleSubmit = () => {
    const payload = {
      title: formData.title,
      slug: formData.slug,
      status: formData.status,
      template: formData.template,
      seo_meta: {
        description: formData.seo_description,
        keywords: formData.seo_keywords,
      },
    };

    createPageMutation.mutate(payload);
  };

  const selectedTemplate = templates.find((t) => t.id === formData.template);

  const getThemePreview = (theme) => {
    const colors = {
      default: "bg-white text-gray-900 border-gray-300",
      dark: "bg-gray-900 text-white border-gray-700",
      light: "bg-white text-gray-800 border-gray-200",
      purple: "bg-purple-50 text-purple-900 border-purple-300",
    };
    return colors[theme] || colors.default;
  };

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/pages")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Create New Page</h1>
          <p className="text-gray-600 mt-1">
            Build your page in 2 simple steps
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${
                step >= 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Select Template</span>
            </div>
            <div
              className={`w-16 h-0.5 ${
                step >= 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                step >= 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Page Details</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Choose a Template</h2>
            <p className="text-gray-600 mb-6">
              Select a template that matches your page style
            </p>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-left p-4 rounded-lg border-2 transition ${
                      formData.template === template.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">
                        {template.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                        {template.theme}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>

                    <div
                      className={`p-3 rounded border ${getThemePreview(
                        template.theme
                      )}`}
                    >
                      <div className="text-xs font-bold mb-1">Preview</div>
                      <div className="text-xs opacity-75">
                        Sample content in {template.theme} theme
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {template.structure?.length || 0} sections included
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No templates available</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.template}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Page Details</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Using:{" "}
                  <span className="font-medium">{selectedTemplate?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change Template
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Admissions 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="admissions-2025"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from title. You can edit it manually.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">Draft</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="published"
                      checked={formData.status === "published"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">Published</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">
                  SEO Settings (Optional)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo_description: e.target.value,
                        })
                      }
                      placeholder="Brief description of this page for search engines"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seo_description.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seo_keywords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo_keywords: e.target.value,
                        })
                      }
                      placeholder="admissions, university, enrollment"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={createPageMutation.isPending}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    createPageMutation.isPending ||
                    !formData.title ||
                    !formData.slug
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {createPageMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {createPageMutation.isPending ? "Creating..." : "Create Page"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
