import React from 'react';
import { useCyclesTopUp } from '../../../hooks/distroManager/useCyclesTopup/useCyclesTopup';

interface CyclesTopUpProps {
  currentUser: any;
}

const CyclesTopUpComponent: React.FC<CyclesTopUpProps> = ({ currentUser }) => {
  const cycleTopUp = useCyclesTopUp(); // Get the cycleTopUp function

  const handleCyclesTopUp = async () => {
    if (currentUser) {
      await cycleTopUp(currentUser); // Call the cycleTopUp function
    }
  };

  return (
    <button onClick={handleCyclesTopUp}>Top Up Cycles</button>
  );
};

export default CyclesTopUpComponent;
