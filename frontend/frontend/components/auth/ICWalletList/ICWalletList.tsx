import React from "react";
import dfinity from "../../../assets/images/dfinity.png";
import plug from "../../../assets/images/plug.png";
import stoic from "../../../assets/images/stoic.png";
import nfid from "../../../assets/images/nfid.png";
import { PlugLogin, StoicLogin, NFIDLogin, IdentityLogin, Types } from 'ic-auth';
import "./ICWalletList.css";

interface ICWalletListProps {
  giveToParent: (principal: string, agent: any, provider: string) => void;
  whitelist: any;
}

const ICWalletList: React.FC<ICWalletListProps> = ({ giveToParent, whitelist }) => {
  const grabUserObject = async (UserObject: Types.UserObject) => {
    giveToParent(UserObject.principal, UserObject.agent, UserObject.provider);
  };

  const handleLogin = async (loginMethod: Function, provider: string) => {
    try {
      const userObject = await loginMethod();
      grabUserObject({ ...userObject, provider });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="wallet-list-container">
      <h2>Connect Your Wallet</h2>
      <div className="wallet-list-buttons">
        <button onClick={() => handleLogin(() => PlugLogin(whitelist), "Plug")}>
          <img src={plug} alt="Plug Wallet" />
          <p>Plug</p>
        </button>
        <button onClick={() => handleLogin(StoicLogin, "Stoic")}>
          <img src={stoic} alt="Stoic Wallet" />
          <p>Stoic</p>
        </button>
        <button onClick={() => handleLogin(NFIDLogin, "NFID")}>
          <img src={nfid} alt="NFID" />
          <p>NFID</p>
        </button>
        <button onClick={() => handleLogin(IdentityLogin, "Identity")}>
          <img src={dfinity} alt="Internet Identity" />
          <p>Identity</p>
        </button>
      </div>
    </div>
  );
};

export default ICWalletList;
