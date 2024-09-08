import React from 'react';
import { useGetBalances } from '../../hooks/distroManager/useGetBalances/useGetBalances'; // Import the new hook

interface GetBalancesProps {
  agent: any;
}

const GetBalancesComponent: React.FC<GetBalancesProps> = ({ agent }) => {
  const { getBalances } = useGetBalances(agent); // Use the hook for getting balances and destructure getBalances

  return (
    <button onClick={() => getBalances()}>Get Balances</button>
  );
};

export default GetBalancesComponent;