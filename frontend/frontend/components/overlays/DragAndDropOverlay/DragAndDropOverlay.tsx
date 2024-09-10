import React, { useState, useCallback } from "react";
import "./DragAndDropOverlay.css";

interface DragAndDropContainerProps {
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

function DragAndDropContainer({ onDrop, children }: DragAndDropContainerProps) {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      setDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.relatedTarget || e.relatedTarget === document.body) {
      setDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      onDrop(e);
    },
    [onDrop]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`drag-and-drop-container ${dragging ? "dragging" : ""}`}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
      {dragging && <div className="overlay">Drop file here to upload</div>}
    </div>
  );
}

export default DragAndDropContainer;