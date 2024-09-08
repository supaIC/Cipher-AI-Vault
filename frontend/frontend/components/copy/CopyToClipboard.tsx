import React, { useState } from 'react';
import './CopyToClipboard.css';

interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

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
