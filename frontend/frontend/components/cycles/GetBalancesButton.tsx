// components/GetBalancesComponent.tsx
import React from 'react';
import { useDistroActor } from '../../context';  // Assuming context is now centralized

interface GetBalancesProps {
  agent: any;
}

const GetBalancesComponent: React.FC<GetBalancesProps> = ({ agent }) => {
  const { createDistroActor } = useDistroActor();

  const getBalances = async () => {
    if (agent) {
      const distroActor = await createDistroActor(agent);
      const balances = await distroActor.getBalances();
      console.log(balances);
    }
  };

  return (
    <button onClick={getBalances}>Get Balances</button>
  );
};

export default GetBalancesComponent;
