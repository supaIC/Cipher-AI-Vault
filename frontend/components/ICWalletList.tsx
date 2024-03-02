// ICWalletList.tsx

import React from "react";
import "../styles/index.css";
import * as logins from "../hooks/walletFunctions";
import dfinity from "../logos/dfinity.png";
import plug from "../logos/plug.png";
import stoic from "../logos/stoic.png";
import nfid from "../logos/nfid.png";

export function ICWalletList({ giveToParent, whitelist }: any) {
  const grabUserObject = async (UserObject: logins.UserObject) => {
    giveToParent(UserObject.principal, UserObject.agent, UserObject.provider);
  };

  // Calls the plug login function and returns it to the parent.

  const handlePlug = async () => {
    try {
      const userObject = await logins.plugLogin(whitelist);
      giveToParent(userObject.principal, userObject.agent, "Plug");
    } catch (error) {
      console.log(error);
    }
  };

  // Calls the stoic login function and returns the userObject to the parent.

  const handleStoic = async () => {
    try {
      const userObject = await logins.stoicLogin(whitelist);
      giveToParent(userObject.principal, userObject.agent, "Stoic");
    } catch (error) {
      console.log(error);
    }
  };

  // Calls the NFID login function and returns the userObject to the parent.

  const handleNFID = async () => {
    try {
      await logins.nfidLogin(grabUserObject);
    } catch (error) {
      console.log(error);
    }
    // giveToParent(userObject.principal, userObject.agent, "NFID");
  };

  const handleII = async () => {
    await logins.identityLogin(grabUserObject);
    // giveToParent(userObject.principal, userObject.agent, "Identity");
  };

  return (
    <div className="app">
      <div className="header">{/* <img src={branding} /> */}</div>
      <div className="walletList">
        <h2>Please Login</h2>
        <button onClick={handlePlug}>
          <p>Plug</p>
          <img src={plug} />
        </button>
        <button onClick={handleStoic}>
          <p>Stoic</p>
          <img src={stoic} />
        </button>
        <button onClick={handleNFID}>
          <p>NFID</p>
          <img src={nfid} />
        </button>
        <button onClick={handleII}>
          <p>Identity</p>
          <img src={dfinity} />
        </button>
      </div>
    </div>
  );
}