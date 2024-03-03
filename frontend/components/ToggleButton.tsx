// ToggleButton.tsx

import React from "react";

// Defines the props expected by the ToggleButton component.
interface ToggleButtonProps {
  label: string; // Text label for the toggle button.
  checked: boolean; // Indicates whether the toggle is in the "on" position.
  onChange: (checked: boolean) => void; // Function to call when the toggle state changes.
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  checked,
  onChange,
}) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="toggle-button">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          className="toggle-checkbox"
        />
        <span className="toggle-switch"></span>
        {label}
      </label>
    </div>
  );
};

export default ToggleButton;