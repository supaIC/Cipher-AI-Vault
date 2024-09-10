// hooks/useGetBalances.ts
import { useDistroActor } from '../../../actors'; // Adjust the path as necessary
import { HttpAgent } from '@dfinity/agent';
import { useState } from 'react';

export const useGetBalances = (agent: HttpAgent | null) => {
  const { createDistroActor } = useDistroActor();
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState<string | null>(null); // Track error messages
  const [balances, setBalances] = useState<any>(null); // Track balances

  const getBalances = async () => {
    if (agent) {
      setLoading(true); // Set loading state to true
      setError(null); // Reset any previous errors
      console.log("Fetching balances...");

      try {
        const distroActor = await createDistroActor(agent);
        const fetchedBalances = await distroActor.getBalances();
        console.log("Balances fetched successfully:", fetchedBalances);
        setBalances(fetchedBalances); // Store the fetched balances
      } catch (error) {
        console.error("Error fetching balances:", error);
        setError("Failed to fetch balances."); // Set error message
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  };

  return { getBalances, loading, error, balances }; // Return loading, error, and balances
};