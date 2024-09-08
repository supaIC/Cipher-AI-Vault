import React from 'react';

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