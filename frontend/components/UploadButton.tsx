import React, { useCallback } from "react";

interface UploadButtonProps {
  onUpload: (file: File) => void;
  disabled: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, disabled }) => {
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      onUpload(file);
    },
    [onUpload]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

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
            e.target.value = "";
          }
        }}
        disabled={disabled}
      />
      <label htmlFor="file" className="file-label">
        {disabled ? "Processing..." : "Select File or Drag and Drop"}
      </label>
    </div>
  );
};

export default UploadButton;