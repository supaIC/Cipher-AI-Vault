import React, { createContext, useContext } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import * as cycles from '../../interfaces/cmc/cmc';
import * as ledger from '../../interfaces/ledger/index';
import * as distro from '../../interfaces/distro/index';

const CANISTER_IDS = {
  cycles: "rkp4c-7iaaa-aaaaa-aaaca-cai",
  ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  distro: "jeb4e-myaaa-aaaak-aflga-cai",
};

interface DistroActorContextType {
  createActors: (currentUser: any) => Promise<any>;
  createDistroActor: (agent: HttpAgent) => Promise<any>;
}

const DistroActorContext = createContext<DistroActorContextType | undefined>(undefined);

export const useDistroActor = () => {
  const context = useContext(DistroActorContext);
  if (!context) {
    throw new Error('useDistroActor must be used within a DistroActorProvider');
  }
  return context;
};

export const DistroActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const createActors = async (currentUser: { agent: any; }) => {
    try {
      const actors: { [key: string]: any } = {};

      const canisters = [
        { name: "cycles", id: CANISTER_IDS.cycles, factory: cycles.idlFactory },
        { name: "ledger", id: CANISTER_IDS.ledger, factory: ledger.idlFactory },
        { name: "distro", id: CANISTER_IDS.distro, factory: distro.idlFactory },
      ];

      for (const { name, id, factory } of canisters) {
        actors[name] = Actor.createActor(factory, {
          agent: currentUser.agent,
          canisterId: id,
        });
      }

      return actors;
    } catch (error) {
      console.error("Error creating actors:", error);
      throw error;
    }
  };
  const createDistroActor = async (agent: HttpAgent) => {
    return Actor.createActor(distro.idlFactory, {
      agent,
      canisterId: CANISTER_IDS.distro,
    });
  };

  return (
    <DistroActorContext.Provider value={{ createActors, createDistroActor }}>
      {children}
    </DistroActorContext.Provider>
  );
};