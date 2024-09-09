import React from 'react';
import './LoggedInUser.css';

interface LoggedInUserProps {
  principal: string;
}

const LoggedInUser: React.FC<LoggedInUserProps> = ({ principal }) => {
  return (
    <div className="logged-in-info">
      Logged in as: {principal}
    </div>
  );
};

export default LoggedInUser;