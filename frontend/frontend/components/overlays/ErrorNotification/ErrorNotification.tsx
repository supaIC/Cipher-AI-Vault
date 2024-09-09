import React from "react";
import "./ErrorNotification.css";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
}) => (
  <div className="error-notification">
    {message}
    <button onClick={onClose}>X</button>{" "}
  </div>
);

export default ErrorNotification;
