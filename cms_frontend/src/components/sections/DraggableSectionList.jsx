import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function SortableSection({
  section,
  index,
  children,
  onDelete,
  onDuplicate,
  isExpanded,
  onToggleExpand,
  isSelected,
  onSelect,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg mb-3 ${
        isDragging ? "shadow-lg" : "shadow-sm"
      } ${isSelected ? "border-blue-500" : "border-gray-200"}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(section.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <div>
            <span className="font-medium capitalize">{section.type}</span>
            <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDuplicate(section)}
            className="p-1 hover:bg-gray-200 rounded text-blue-600"
            title="Duplicate section"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleExpand(section.id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      {children}
    </div>
  );
}

export default function DraggableSectionList({
  sections,
  onReorder,
  onDelete,
  onDuplicate,
  expandedSection,
  onToggleExpand,
  selectedSections,
  onSelectSection,
  children,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      onReorder(newSections);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {sections.map((section, index) => (
          <SortableSection
            key={section.id}
            section={section}
            index={index}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            isExpanded={expandedSection === section.id}
            onToggleExpand={onToggleExpand}
            isSelected={selectedSections.includes(section.id)}
            onSelect={onSelectSection}
          >
            {children(section, index, expandedSection === section.id)}
          </SortableSection>
        ))}
      </SortableContext>
    </DndContext>
  );
}
