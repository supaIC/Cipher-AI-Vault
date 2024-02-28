import React, { useState } from "react"
import { HttpAgent } from "@dfinity/agent";
import { ICWalletList } from "./ICWalletList";
import { UserObject } from "./functions";
import { AssetManager } from "@dfinity/assets";

export function Parent() {

  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);

  const giveToParent = (principal: string, agent: HttpAgent, provider: string) => {
    setCurrentUser({principal, agent, provider});
  }

  const createAssetActor = async() : Promise<AssetManager> => {
    const assetActor = new AssetManager({agent: currentUser!.agent as HttpAgent, canisterId: "zks6t-giaaa-aaaap-qb7fa-cai"});
    return assetActor;
  }

  const createFileUploadInterface = async() => {
    const rootDiv = document.getElementById("root");
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "1000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    rootDiv?.appendChild(overlay);

    const container = document.createElement("div");
    // make the div appear in the center and have a file upload button
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.backgroundColor = "white";
    container.style.padding = "20px";
    container.style.border = "2px solid black";
    container.style.borderRadius = "10px";
    container.style.zIndex = "1000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.width = "300px";
    container.style.height = "300px";
    container.style.overflow = "hidden";
    container.style.boxShadow = "0px 0px 10px 0px black";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    const fileButton = document.createElement("button");
    fileButton.textContent = "Select File";
    fileButton.style.backgroundColor = "blue";
    fileButton.style.color = "white";
    fileButton.style.padding = "10px";
    fileButton.style.border = "none";
    fileButton.style.borderRadius = "10px";
    fileButton.style.margin = "10px";
    fileButton.style.cursor = "pointer";
    fileButton.onclick = () => {
      fileInput.click();
    }
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.backgroundColor = "green";
    submitButton.style.color = "white";
    submitButton.style.padding = "10px";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "10px";
    submitButton.style.margin = "10px";
    submitButton.style.cursor = "pointer";
    submitButton.onclick = async() => {
      const actor = await createAssetActor();
      const file = fileInput.files![0];
      const response = await actor.store(file);
      alert(response);
    }
    // fileInput.onchange = () => {
    //   if (fileInput.files) {
    //     const file = fileInput.files[0];
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //       const fileData = reader.result;
    //       alert(fileData);
    //     }
    //     reader.readAsText(file);
    //   }
    // }
    container.appendChild(fileButton);
    container.appendChild(submitButton);
    container.appendChild(fileInput);
    overlay.appendChild(container);
  }

  const whitelist: Array<string> = ["zks6t-giaaa-aaaap-qb7fa-cai"];

  const uploadFile = async() => {
    await createFileUploadInterface();
  }
 
  return (
    <div className="app">
      {!currentUser && 
      <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
      }
      {
        currentUser && 
        <>
          <button onClick={uploadFile} >File Upload</button>
        </>
      }
    </div>
  )
}