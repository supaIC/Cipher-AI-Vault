import { useState } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { AssetManager } from '@dfinity/assets';
import { PlugLogin, CreateActor, HelloIDL } from 'ic-auth';

function App() {

  const canisterID = "zj5ne-6iaaa-aaaak-qimtq-cai";
  const whitelist = [canisterID];
  const [actor, setActor] = useState(null);

  async function login() {
    try {
      console.log("logging in...");
      const userObject = await PlugLogin(whitelist);
      const assetManager = new AssetManager({ agent: userObject.agent, canisterId: canisterID });
      setActor(assetManager);
      console.log("Logged In!");
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async function listFiles() {
    console.log(actor);
    const files = await actor.list();
    console.log(files);
  }

  async function handleUpload() {
    console.log("Uploading...");
    const file = document.getElementById('file').files[0];
    const link = document.getElementById('link');
    const fileID = await actor.store(file);
    link.href = `https://${canisterID}.icp0.io${fileID}`;
    link.innerText = link.href;
    console.log("Uploaded!");
  }

  async function deleteFile() {
    console.log("Deleting...");
    const fileID = prompt("Enter the file ID to delete:");
    await actor.delete(fileID);
    console.log("Deleted!");
  }

  async function verfiyFile() {
    console.log("Verifying...");
    const fileID = prompt("Enter the file ID to verify:");
    const verified = await actor.get(fileID);
    console.log(verified);
  }

  return (
    <div>
      <h1>Asset Manager</h1>
      <button onClick={login}>Login</button>
      <button onClick={listFiles}>List Files</button>
      <input type="file" id="file"/>
      <button onClick={handleUpload}>Upload</button>
      <a href='' id='link' />
      <div style={{marginTop: '10px'}} />
      <button onClick={deleteFile}>Delete File</button>
      <button onClick={verfiyFile}>Verify File</button>
    </div>
  );
}

export default App;
