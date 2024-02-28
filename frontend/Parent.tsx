import React, { useEffect, useState } from "react"
import { HttpAgent } from "@dfinity/agent";
import { ICWalletList } from "./ICWalletList";
import { UserObject } from "./functions";
import { AssetManager } from "@dfinity/assets";
import "./index.css";

export function Parent() {

  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);

  // This function is passed to the ICWalletList component to handle the user auth process.
  const giveToParent = (principal: string, agent: HttpAgent, provider: string) => {
    setCurrentUser({principal, agent, provider});
  }

  // This creates an instance of the asset canister actor.
  const createAssetActor = async() : Promise<AssetManager> => {
    const assetActor = new AssetManager({agent: currentUser!.agent as HttpAgent, canisterId: "zks6t-giaaa-aaaap-qb7fa-cai"});
    return assetActor;
  }

  const deleteAsset = async(key: string) => {
    const actor = await createAssetActor();
    const response = await actor.delete(key);
    alert(response);
  }

  // This lists the available files in the asset canister.
  const loadList = async() => {
    const actor = await createAssetActor();
    const list = await actor.list();
    const stuff = document.getElementById("stuff");
    if (stuff) {
      const listDiv = document.createElement("div");
      listDiv.style.display = "flex";
      listDiv.style.flexDirection = "column";
      listDiv.style.alignItems = "center";
      listDiv.style.justifyContent = "center";
      list.forEach((file) => {
        const name = document.createElement("img");
        const header = "https://zks6t-giaaa-aaaap-qb7fa-cai.raw.icp0.io/";
        // if file key starts with a slash just remove it
        if (file.key.startsWith("/")) {
          name.src = header + file.key.slice(1);
        } else {
          name.src = header + file.key;
        }
        name.style.width = "100px";
        name.style.height = "100px";
        name.style.margin = "10px";
        name.style.borderRadius = "10px";
        name.onclick = async() => {
          const rootDiv = document.getElementById("options");
          if (rootDiv) {
            rootDiv.innerHTML = "";
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.style.backgroundColor = "red";
            deleteButton.style.color = "white";
            deleteButton.style.padding = "10px";
            deleteButton.style.border = "none";
            deleteButton.style.borderRadius = "10px";
            deleteButton.style.margin = "10px";
            deleteButton.style.cursor = "pointer";
            deleteButton.onclick = async() => {
              await deleteAsset(file.key);
              rootDiv.innerHTML = "";
              await loadList();
            }
            rootDiv.appendChild(deleteButton);
          }
        }
        
        listDiv.appendChild(name);
      }
      )
      stuff.appendChild(listDiv);
    }
  }

  // This function creates a temporary file upload interface.
  // Todo: Needs styling and error handling.
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
      overlay.remove();
      await loadList();
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
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.backgroundColor = "red";
    cancelButton.style.color = "white";
    cancelButton.style.padding = "10px";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "10px";
    cancelButton.style.margin = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.onclick = () => {
      overlay.remove();
    }
    container.appendChild(fileButton);
    container.appendChild(submitButton);
    container.appendChild(cancelButton);
    container.appendChild(fileInput);
    overlay.appendChild(container);
  }

  const whitelist: Array<string> = ["zks6t-giaaa-aaaap-qb7fa-cai"];

  const uploadFile = async() => {
    await createFileUploadInterface();
  }

  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  } , [currentUser]);
 
  return (
    <div className="app">
      {!currentUser && 
      <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
      }
      {
        currentUser && 
        <div className="overlay">
          <button onClick={uploadFile} >File Upload</button>
          <div id="stuff"></div>
          <div id='options'></div>
        </div>
      }
    </div>
  )
}