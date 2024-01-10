import React, { useState } from "react"
import { HttpAgent } from "@dfinity/agent";
import { ICWalletList } from "./ICWalletList";
import { UserObject } from "./functions";

export function Parent() {

  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);

  const giveToParent = (principal: string, agent: HttpAgent, provider: string) => {
    setCurrentUser({principal, agent, provider});
  }

  const whitelist: Array<string> = [];

  return (
    <div className="app">
      {!currentUser && 
      <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
      }
      {
        currentUser && 
        <>
        <div>
          <h1>Current User:</h1>
          <p>{currentUser.principal}</p>
          <p>{currentUser.provider}</p>
        </div>
        <div>
        <h1>Current Agent:</h1>
        <p style={{width: '500px'}}>{JSON.stringify(currentUser.agent)}</p>
      </div>
      </>
      }
    </div>
  )
}