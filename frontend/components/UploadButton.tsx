// UploadButton.tsx

import React, { useCallback } from "react";

// Props definition for the UploadButton component.
interface UploadButtonProps {
  onUpload: (file: File) => void; // Callback function to handle file upload.
  disabled: boolean; // Boolean to enable or disable the upload functionality.
}

/**
 * UploadButton component provides an interface for users to upload files either
 * by selecting them through a file input or by dragging and dropping them onto the component.
 *
 * Props:
 * - onUpload: A function that is called when a file is selected or dropped onto the component.
 * - disabled: A boolean that disables the input and changes the label if true.
 *
 * The component listens for drag-and-drop events as well as changes to the file input field to trigger uploads.
 * It is designed to be flexible and reusable in any part of the application that requires file uploading capability.
 */
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