import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Eye,
  Save,
  Undo,
  Redo,
  AlertCircle,
} from "lucide-react";
import API from "../api/axios";
import SectionPreview from "../components/sections/SectionPreview";
import TableEditor from "../components/sections/TableEditor";
import AddSectionModal from "../components/sections/AddSectionModal";
import DraggableSectionList from "../components/sections/DraggableSectionList";
import BulkActionsToolbar from "../components/sections/BulkActionsToolbar";
import useUndoRedo from "../hooks/useUndoRedo";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: handlePageSave,
    canUndo,
    canRedo,
  });
  // Fetch page with sections
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      const pageRes = await API.get(`pages/${id}/`);
      const sectionsRes = await API.get(`sections/`);
      const pageSections = sectionsRes.data
        .filter((s) => s.page === id)
        .sort((a, b) => a.order - b.order);
      return { ...pageRes.data, sections: pageSections };
    },
  });

  // Undo/Redo for sections
  const {
    state: sections,
    setState: setSections,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo(page?.sections || []);

  // Initialize undo/redo history when page loads
  useEffect(() => {
    if (page?.sections) {
      resetHistory(page.sections);
    }
  }, [page?.sections, resetHistory]);

  // Track unsaved changes
  useEffect(() => {
    if (page?.sections) {
      const hasChanges =
        JSON.stringify(sections) !== JSON.stringify(page.sections);
      setHasUnsavedChanges(hasChanges);
    }
  }, [sections, page?.sections]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (sectionData) => {
      const res = await API.post(`sections/`, sectionData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["page", id]);
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionId, data }) => {
      const res = await API.put(`sections/${sectionId}/`, data);
      return res.data;
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId) => {
      await API.delete(`sections/${sectionId}/`);
    },
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data) => {
      const res = await API.put(`pages/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["page", id]);
      setHasUnsavedChanges(false);
      alert("Page saved successfully!");
    },
  });

  // Batch update sections
  const batchUpdateSections = async (sectionsToUpdate) => {
    const promises = sectionsToUpdate.map((section, index) =>
      updateSectionMutation.mutateAsync({
        sectionId: section.id,
        data: {
          page: section.page,
          type: section.type,
          properties: section.properties,
          order: index + 1,
        },
      })
    );
    await Promise.all(promises);
    queryClient.invalidateQueries(["page", id]);
  };

  const handleAddSection = (sectionType) => {
    const maxOrder =
      sections.length > 0 ? Math.max(...sections.map((s) => s.order)) : 0;

    const tempId = `temp-${Date.now()}`;
    const newSection = {
      id: tempId,
      page: id,
      type: sectionType.type,
      properties: sectionType.defaultProps,
      order: maxOrder + 1,
    };

    setSections([...sections, newSection]);
  };

  const handleSectionUpdate = (sectionId, newProperties) => {
    const updatedSections = sections.map((s) =>
      s.id === sectionId ? { ...s, properties: newProperties } : s
    );
    setSections(updatedSections);
  };

  const handleDeleteSection = (sectionId) => {
    if (confirm("Are you sure you want to delete this section?")) {
      const updatedSections = sections.filter((s) => s.id !== sectionId);
      setSections(updatedSections);
      setSelectedSections((prev) => prev.filter((id) => id !== sectionId));
    }
  };

  const handleDuplicateSection = (section) => {
    const tempId = `temp-${Date.now()}`;
    const duplicated = {
      ...section,
      id: tempId,
      order: section.order + 1,
    };

    const sectionIndex = sections.findIndex((s) => s.id === section.id);
    const newSections = [...sections];
    newSections.splice(sectionIndex + 1, 0, duplicated);

    setSections(newSections);
  };

  const handleReorder = (newSections) => {
    setSections(newSections);
  };

  const handleSelectSection = (sectionId, checked) => {
    setSelectedSections((prev) =>
      checked ? [...prev, sectionId] : prev.filter((id) => id !== sectionId)
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedSections.length} sections?`)) {
      const updatedSections = sections.filter(
        (s) => !selectedSections.includes(s.id)
      );
      setSections(updatedSections);
      setSelectedSections([]);
    }
  };

  const handleBulkDuplicate = () => {
    const newSections = [...sections];
    const toDuplicate = sections.filter((s) => selectedSections.includes(s.id));

    toDuplicate.forEach((section) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const duplicated = {
        ...section,
        id: tempId,
      };
      newSections.push(duplicated);
    });

    setSections(newSections);
    setSelectedSections([]);
  };

  const handleBulkMoveUp = () => {
    const newSections = [...sections];
    const sortedSelected = selectedSections.sort(
      (a, b) =>
        sections.findIndex((s) => s.id === a) -
        sections.findIndex((s) => s.id === b)
    );

    sortedSelected.forEach((sectionId) => {
      const currentIndex = newSections.findIndex((s) => s.id === sectionId);
      if (
        currentIndex > 0 &&
        !selectedSections.includes(newSections[currentIndex - 1].id)
      ) {
        [newSections[currentIndex], newSections[currentIndex - 1]] = [
          newSections[currentIndex - 1],
          newSections[currentIndex],
        ];
      }
    });

    setSections(newSections);
  };

  const handleBulkMoveDown = () => {
    const newSections = [...sections];
    const sortedSelected = selectedSections.sort(
      (a, b) =>
        sections.findIndex((s) => s.id === b) -
        sections.findIndex((s) => s.id === a)
    );

    sortedSelected.forEach((sectionId) => {
      const currentIndex = newSections.findIndex((s) => s.id === sectionId);
      if (
        currentIndex < newSections.length - 1 &&
        !selectedSections.includes(newSections[currentIndex + 1].id)
      ) {
        [newSections[currentIndex], newSections[currentIndex + 1]] = [
          newSections[currentIndex + 1],
          newSections[currentIndex],
        ];
      }
    });

    setSections(newSections);
  };

  const handlePageSave = async () => {
    // Update page metadata
    await updatePageMutation.mutateAsync({
      title: page.title,
      slug: page.slug,
      status: page.status,
      template: page.template,
      seo_meta: page.seo_meta,
    });

    // Delete removed sections
    const removedSections = page.sections.filter(
      (ps) => !sections.find((s) => s.id === ps.id)
    );
    for (const section of removedSections) {
      await deleteSectionMutation.mutateAsync(section.id);
    }

    // Create new sections and update existing ones
    const sectionsToUpdate = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.id.toString().startsWith("temp-")) {
        // Create new section
        const created = await createSectionMutation.mutateAsync({
          page: id,
          type: section.type,
          properties: section.properties,
          order: i + 1,
        });
        sectionsToUpdate.push(created);
      } else {
        sectionsToUpdate.push({ ...section, order: i + 1 });
      }
    }

    // Batch update all sections with new orders
    await batchUpdateSections(sectionsToUpdate);
  };

  const renderSectionEditor = (section, index, isExpanded) => {
    if (!isExpanded && !previewMode) {
      return (
        <div className="p-4 bg-gray-50">
          <SectionPreview section={section} theme={page?.template?.theme} />
        </div>
      );
    }

    if (previewMode) {
      return (
        <div className="p-4">
          <SectionPreview section={section} theme={page?.template?.theme} />
        </div>
      );
    }

    return (
      <div className="p-4">
        {section.type === "heading" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Heading Text
            </label>
            <input
              type="text"
              value={section.properties.text || ""}
              onChange={(e) =>
                handleSectionUpdate(section.id, { text: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {section.type === "paragraph" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Paragraph Text
            </label>
            <textarea
              value={section.properties.text || ""}
              onChange={(e) =>
                handleSectionUpdate(section.id, { text: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {section.type === "button" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={section.properties.text || ""}
                onChange={(e) =>
                  handleSectionUpdate(section.id, {
                    ...section.properties,
                    text: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Button Link
              </label>
              <input
                type="text"
                value={section.properties.href || ""}
                onChange={(e) =>
                  handleSectionUpdate(section.id, {
                    ...section.properties,
                    href: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}

        {section.type === "image" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={section.properties.url || ""}
                onChange={(e) =>
                  handleSectionUpdate(section.id, {
                    ...section.properties,
                    url: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <input
                type="text"
                value={section.properties.alt || ""}
                onChange={(e) =>
                  handleSectionUpdate(section.id, {
                    ...section.properties,
                    alt: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {section.properties.url && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">
                  Preview
                </label>
                <img
                  src={section.properties.url}
                  alt={section.properties.alt}
                  className="max-w-sm rounded border"
                />
              </div>
            )}
          </div>
        )}

        {section.type === "table" && (
          <div>
            <label className="block text-sm font-medium mb-2">Table Data</label>
            <TableEditor
              rows={section.properties.rows || [[""]]}
              onChange={(newRows) =>
                handleSectionUpdate(section.id, { rows: newRows })
              }
            />
          </div>
        )}

        {/* Preview in editor */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="text-xs font-medium text-gray-500 mb-2">Preview:</div>
          <SectionPreview section={section} theme={page?.template?.theme} />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (
                      confirm(
                        "You have unsaved changes. Are you sure you want to leave?"
                      )
                    ) {
                      navigate("/pages");
                    }
                  } else {
                    navigate("/pages");
                  }
                }}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-xl font-bold">{page?.title}</h1>
                <p className="text-sm text-gray-500">/{page?.slug}</p>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Undo/Redo */}
              <div className="flex items-center gap-1 border rounded-lg">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 hover:bg-gray-100 rounded-l-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 hover:bg-gray-100 rounded-r-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                  previewMode
                    ? "bg-blue-50 border-blue-600 text-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Edit Mode" : "Preview"}
              </button>
              <button
                onClick={() =>
                  window.open(
                    `http://localhost:8000/api/pages/${page?.slug}/render/`,
                    "_blank"
                  )
                }
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                Live Preview
              </button>
              <button
                onClick={handlePageSave}
                disabled={updatePageMutation.isPending || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {updatePageMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sections Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {previewMode ? "Page Preview" : "Page Sections"}
                  </h2>
                  {selectedSections.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedSections.length} section
                      {selectedSections.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
                {!previewMode && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                )}
              </div>

              {sections && sections.length > 0 ? (
                <div>
                  {previewMode ? (
                    // Preview Mode - Just show rendered sections
                    <div
                      className={`p-6 rounded-lg ${
                        page?.template?.theme === "dark"
                          ? "bg-gray-900"
                          : page?.template?.theme === "purple"
                          ? "bg-purple-50"
                          : "bg-white"
                      }`}
                    >
                      {sections.map((section) => (
                        <div key={section.id} className="my-4">
                          <SectionPreview
                            section={section}
                            theme={page?.template?.theme}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Edit Mode - Draggable sections
                    <DraggableSectionList
                      sections={sections}
                      onReorder={handleReorder}
                      onDelete={handleDeleteSection}
                      onDuplicate={handleDuplicateSection}
                      expandedSection={expandedSection}
                      onToggleExpand={(id) =>
                        setExpandedSection(expandedSection === id ? null : id)
                      }
                      selectedSections={selectedSections}
                      onSelectSection={handleSelectSection}
                    >
                      {renderSectionEditor}
                    </DraggableSectionList>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No sections yet</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add your first section
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Page Settings Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-bold mb-4">Page Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={page?.title || ""}
                    onChange={(e) => {
                      page.title = e.target.value;
                      queryClient.setQueryData(["page", id], page);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-1">/</span>
                    <input
                      type="text"
                      value={page?.slug || ""}
                      onChange={(e) => {
                        page.slug = e.target.value;
                        queryClient.setQueryData(["page", id], page);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={page?.status}
                    onChange={(e) => {
                      page.status = e.target.value;
                      queryClient.setQueryData(["page", id], page);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Theme
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm capitalize">
                    {page?.template?.theme || "default"}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Created: {new Date(page?.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      Updated: {new Date(page?.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-bold mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={page?.seo_meta?.description || ""}
                    onChange={(e) => {
                      page.seo_meta = {
                        ...page.seo_meta,
                        description: e.target.value,
                      };
                      queryClient.setQueryData(["page", id], page);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Brief description for search engines"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(page?.seo_meta?.description || "").length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={page?.seo_meta?.keywords || ""}
                    onChange={(e) => {
                      page.seo_meta = {
                        ...page.seo_meta,
                        keywords: e.target.value,
                      };
                      queryClient.setQueryData(["page", id], page);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-bold mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sections</span>
                  <span className="font-medium">{sections?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Headings</span>
                  <span className="font-medium">
                    {sections?.filter((s) => s.type === "heading").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paragraphs</span>
                  <span className="font-medium">
                    {sections?.filter((s) => s.type === "paragraph").length ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images</span>
                  <span className="font-medium">
                    {sections?.filter((s) => s.type === "image").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tables</span>
                  <span className="font-medium">
                    {sections?.filter((s) => s.type === "table").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Buttons</span>
                  <span className="font-medium">
                    {sections?.filter((s) => s.type === "button").length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-bold mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Undo</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">
                    Ctrl+Z
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Redo</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">
                    Ctrl+Y
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Save</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">
                    Ctrl+S
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedSections.length}
        onDelete={handleBulkDelete}
        onDuplicate={handleBulkDuplicate}
        onMoveUp={handleBulkMoveUp}
        onMoveDown={handleBulkMoveDown}
        onClear={() => setSelectedSections([])}
      />

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSection}
      />
    </div>
  );
}
