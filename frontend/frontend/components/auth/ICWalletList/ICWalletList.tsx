import React from "react";
// Import logo assets for different wallets
import dfinity from "../../../assets/images/dfinity.png";
import plug from "../../../assets/images/plug.png";
import stoic from "../../../assets/images/stoic.png";
import nfid from "../../../assets/images/nfid.png";
// Import authentication functions and types from ic-auth library
import { PlugLogin, StoicLogin, NFIDLogin, IdentityLogin, CreateActor, Types } from 'ic-auth';
import "./ICWalletList.css"

// ICWalletList component for displaying wallet login options
const ICWalletList = ({ giveToParent, whitelist }: any) => {
  // Function to handle user object after successful login
  const grabUserObject = async (UserObject: Types.UserObject) => {
    giveToParent(UserObject.principal, UserObject.agent, UserObject.provider);
  };

  // Handler for Plug wallet login
  const handlePlug = async () => {
    try {
      const userObject = await PlugLogin(whitelist);
      giveToParent(userObject.principal, userObject.agent, "Plug");
    } catch (error) {
      console.log(error);
    }
  };

  // Handler for Stoic wallet login
  const handleStoic = async () => {
    try {
      const userObject = await StoicLogin();
      giveToParent(userObject.principal, userObject.agent, "Stoic");
    } catch (error) {
      console.log(error);
    }
  };

  // Handler for NFID login
  const handleNFID = async () => {
    try {
      const userObject: Types.UserObject = await NFIDLogin();
      grabUserObject(userObject);
    } catch (error) {
      console.log(error);
    }
  };

  // Handler for Internet Identity login
  const handleII = async () => {
    try {
      const userObject = await IdentityLogin();
      grabUserObject(userObject);
    } catch (error) {
      console.log(error);
    }
  };

  // Render the wallet list UI
  return (
    <div className="app">
      <div className="header"></div>
      <div className="walletList">
        <h2>Please Login</h2>
        {/* Plug wallet login button */}
        <button onClick={handlePlug}>
          <p>Plug</p>
          <img src={plug} />
        </button>
        {/* Stoic wallet login button */}
        <button onClick={handleStoic}>
          <p>Stoic</p>
          <img src={stoic} />
        </button>
        {/* NFID login button */}
        <button onClick={handleNFID}>
          <p>NFID</p>
          <img src={nfid} />
        </button>
        {/* Internet Identity login button */}
        <button onClick={handleII}>
          <p>Identity</p>
          <img src={dfinity} />
        </button>
      </div>
    </div>
  );
};

export default ICWalletList;
