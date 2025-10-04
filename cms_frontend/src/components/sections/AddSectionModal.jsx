import React, { useState } from "react";
import { X, FileText, Type, Image, Link, Table } from "lucide-react";

const sectionTypes = [
  {
    type: "heading",
    label: "Heading",
    icon: Type,
    description: "Add a section heading",
    defaultProps: { text: "New Heading" },
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: FileText,
    description: "Add text content",
    defaultProps: { text: "New paragraph content" },
  },
  {
    type: "button",
    label: "Button",
    icon: Link,
    description: "Add a clickable button",
    defaultProps: { text: "Click Me", href: "#" },
  },
  {
    type: "image",
    label: "Image",
    icon: Image,
    description: "Add an image",
    defaultProps: { url: "", alt: "Image" },
  },
  {
    type: "table",
    label: "Table",
    icon: Table,
    description: "Add a data table",
    defaultProps: {
      rows: [
        ["Cell 1", "Cell 2"],
        ["Cell 3", "Cell 4"],
      ],
    },
  },
];

export default function AddSectionModal({ isOpen, onClose, onAdd }) {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (selected) {
      onAdd(selected);
      setSelected(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Add New Section</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Choose a section type to add to your page
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionTypes.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.type}
                  onClick={() => setSelected(section)}
                  className={`text-left p-4 border-2 rounded-lg transition ${
                    selected?.type === section.type
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selected?.type === section.type
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{section.label}</h3>
                      <p className="text-sm text-gray-600">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
}
