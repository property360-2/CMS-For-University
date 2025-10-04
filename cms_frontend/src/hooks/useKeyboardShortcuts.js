import { useEffect } from "react";

export default function useKeyboardShortcuts({
    onUndo,
    onRedo,
    onSave,
    canUndo,
    canRedo,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + Z for Undo
            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) onUndo();
            }

            // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for Redo
            if (
                ((e.ctrlKey || e.metaKey) && e.key === "y") ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
            ) {
                e.preventDefault();
                if (canRedo) onRedo();
            }

            // Ctrl/Cmd + S for Save
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                onSave();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onUndo, onRedo, onSave, canUndo, canRedo]);
}