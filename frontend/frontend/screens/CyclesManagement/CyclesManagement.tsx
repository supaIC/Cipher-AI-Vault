import React from 'react';
import CyclesTopUpComponent from '../../components/buttons/cycles/CyclesTopUpButton';
import GetBalancesComponent from '../../components/buttons/cycles/GetBalancesButton';
import './CycleManagement.css';

interface CycleManagementProps {
  currentUser: any;
}

const CycleManagement: React.FC<CycleManagementProps> = ({ currentUser }) => {
  return (
    <div className="cycle-management-card">
      <h2 className="cycle-management-title">Cycle Management</h2>
      <div className="cycle-management-controls">
        <GetBalancesComponent agent={currentUser.agent} />
        <CyclesTopUpComponent currentUser={currentUser} />
      </div>
    </div>
  );
};

export default CycleManagement;
