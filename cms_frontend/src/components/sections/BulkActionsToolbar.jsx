import React from "react";
import { Trash2, Copy, MoveUp, MoveDown, X } from "lucide-react";

export default function BulkActionsToolbar({
  selectedCount,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onClear,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4 z-50 animate-slideUp">
      <div className="flex items-center gap-2">
        <span className="font-medium">{selectedCount} selected</span>
        <button
          onClick={onClear}
          className="p-1 hover:bg-gray-800 rounded"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-700"></div>

      <div className="flex items-center gap-2">
        <button
          onClick={onMoveUp}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          title="Move selected up"
        >
          <MoveUp className="w-4 h-4" />
          Move Up
        </button>
        <button
          onClick={onMoveDown}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          title="Move selected down"
        >
          <MoveDown className="w-4 h-4" />
          Move Down
        </button>
        <button
          onClick={onDuplicate}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          title="Duplicate selected"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm"
          title="Delete selected"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
