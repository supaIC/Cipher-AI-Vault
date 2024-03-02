// ToggleButton.tsx

import React from "react";

// Defines the props expected by the ToggleButton component.
interface ToggleButtonProps {
  label: string; // Text label for the toggle button.
  checked: boolean; // Indicates whether the toggle is in the "on" position.
  onChange: (checked: boolean) => void; // Function to call when the toggle state changes.
}

/**
 * ToggleButton is a functional React component that renders a labeled checkbox
 * acting as a toggle switch. It allows users to switch between two states, such as "on" and "off".
 *
 * Props:
 * - label: The text displayed next to the toggle switch.
 * - checked: A boolean indicating the current state of the toggle (true for "on", false for "off").
 * - onChange: A callback function that is invoked when the toggle state changes, receiving the new state.
 *
 * The component visually represents the toggle state and provides an interactive way for users to change it.
 * It's commonly used for settings that can be enabled or disabled.
 */
const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  checked,
  onChange,
}) => {
  // Event handler for when the toggle is clicked.
  const handleToggle = () => {
    onChange(!checked); // Inverts the current state and triggers the onChange callback.
  };

  // Render the checkbox input as a toggle button with an associated label.
  return (
    <div className="toggle-button">
      <label>
        <input type="checkbox" checked={checked} onChange={handleToggle} />
        {label} {/* Display the label text next to the toggle */}
      </label>
    </div>
  );
};

export default ToggleButton;