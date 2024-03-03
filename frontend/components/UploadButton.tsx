// UploadButton.tsx

import React, { useCallback } from "react";

// Props definition for the UploadButton component.
interface UploadButtonProps {
  onUpload: (file: File) => void; // Callback function to handle file upload.
  disabled: boolean; // Boolean to enable or disable the upload functionality.
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, disabled }) => {
  // Handles the drop event by preventing the default action, retrieving the file from the event, and calling onUpload.
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      onUpload(file);
    },
    [onUpload]
  );

  // Prevents the default behavior for the dragover event to allow for the drop event to be triggered.
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Renders the upload button with drag-and-drop functionality.
  return (
    <div
      className="upload-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        id="file"
        className="file-input"
        onChange={(e) => {
          if (e.target.files?.length) {
            onUpload(e.target.files[0]);
            e.target.value = ""; // Clears the file input after upload for potential subsequent uploads.
          }
        }}
        disabled={disabled} // Disables the input if the disabled prop is true.
      />
      <label htmlFor="file" className="file-label">
        {disabled ? "Processing..." : "Select File or Drag and Drop"}
        {/* Displays a custom message based on the disabled state. */}
      </label>
    </div>
  );
};

export default UploadButton;