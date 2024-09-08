import React from "react";
import "../../styles/index.css";
import dfinity from "../../assets/logos/dfinity.png";
import plug from "../../assets/logos/plug.png";
import stoic from "../../assets/logos/stoic.png";
import nfid from "../../assets/logos/nfid.png";
import { PlugLogin, StoicLogin, NFIDLogin, IdentityLogin, CreateActor, Types } from 'ic-auth';

const ICWalletList = ({ giveToParent, whitelist }: any) => {
  const grabUserObject = async (UserObject: Types.UserObject) => {
    giveToParent(UserObject.principal, UserObject.agent, UserObject.provider);
  };

  const handlePlug = async () => {
    try {
      const userObject = await PlugLogin(whitelist);
      giveToParent(userObject.principal, userObject.agent, "Plug");
    } catch (error) {
      console.log(error);
    }
  };

  const handleStoic = async () => {
    try {
      const userObject = await StoicLogin();
      giveToParent(userObject.principal, userObject.agent, "Stoic");
    } catch (error) {
      console.log(error);
    }
  };

  const handleNFID = async () => {
    try {
      const userObject: Types.UserObject = await NFIDLogin();
      grabUserObject(userObject);
    } catch (error) {
      console.log(error);
    }
  };

  const handleII = async () => {
    try {
      const userObject = await IdentityLogin();
      grabUserObject(userObject);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="app">
      <div className="header"></div>
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
};

export default ICWalletList; // Use default export
