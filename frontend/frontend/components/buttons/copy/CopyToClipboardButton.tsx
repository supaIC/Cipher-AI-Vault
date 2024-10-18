// CopyToClipboard.tsx
import React from 'react';
import './CopyToClipboardButton.css';
import { useStore } from '../../../store/store'; // Adjust the path based on your project structure

interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  // Retrieve copySuccess and setCopySuccess from the store
  const copySuccess = useStore((state) => state.copySuccess);
  const setCopySuccess = useStore((state) => state.setCopySuccess);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => setCopySuccess("Copied!"))
      .catch(() => setCopySuccess("Failed to copy."));
  };

  return (
    <div>
      <button onClick={copyToClipboard} className="copy-json-button">
        Copy Raw JSON
      </button>
      {copySuccess && <div className="copy-feedback">{copySuccess}</div>}
    </div>
  );
};

export default CopyToClipboard;
