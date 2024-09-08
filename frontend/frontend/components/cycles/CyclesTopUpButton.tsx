// components/CyclesTopUpComponent.tsx
import React from 'react';
import { cyclesTopUp } from '../../hooks/useCyclesTopup/useCyclesTopup';

interface CyclesTopUpProps {
  currentUser: any;
}

const CyclesTopUpComponent: React.FC<CyclesTopUpProps> = ({ currentUser }) => {
  const handleCyclesTopUp = async () => {
    if (currentUser) {
      await cyclesTopUp(currentUser);
    }
  };

  return (
    <button onClick={handleCyclesTopUp}>Top Up Cycles</button>
  );
};

export default CyclesTopUpComponent;
