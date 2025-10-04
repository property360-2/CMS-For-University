import { useState, useCallback } from "react";

export default function useUndoRedo(initialState) {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentState = history[currentIndex];

    const setState = useCallback((newState) => {
        setHistory((prev) => {
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(newState);
            // Limit history to 50 items
            if (newHistory.length > 50) {
                newHistory.shift();
                return newHistory;
            }
            return newHistory;
        });
        setCurrentIndex((prev) => Math.min(prev + 1, 49));
    }, [currentIndex]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, history.length]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const reset = useCallback((newState) => {
        setHistory([newState]);
        setCurrentIndex(0);
    }, []);

    return {
        state: currentState,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        reset,
    };
}