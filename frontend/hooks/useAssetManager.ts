import { useCallback, useState, useEffect } from "react";
import { HttpAgent } from "@dfinity/agent";
import { AssetManager } from "@dfinity/assets";
import { UserObject } from "./authFunctions";
import { canisterId } from "../config";

// Define interface for Asset object
export interface Asset {
  key: string;
  url: string;
}

// Custom hook for managing asset-related operations
export function useAssetManager(
  currentUser: UserObject | null,
  bucketName: string | null
) {
  // State variables for managing assets and related operations
  const [showUserFiles, setShowUserFiles] = useState<boolean>(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Function to create an instance of AssetManager actor
  const createAssetActor = useCallback(async (): Promise<AssetManager> => {
    // Ensure currentUser and bucketName are available
    if (!currentUser || !bucketName) {
      const errorMessage = "CurrentUser or bucketName is not set.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    // Log information about the creation of AssetManager
    console.log("Creating AssetManager with currentUser:", currentUser);
    console.log("Bucket name:", bucketName);
    // Return a new instance of AssetManager
    return new AssetManager({
      agent: currentUser.agent as HttpAgent,
      canisterId: canisterId, // Use the Canister ID from the config file
    });
  }, [currentUser, bucketName]);

  // Function to load the list of assets
  const loadList = useCallback(async () => {
    setGlobalLoading(true);
    setLoadingMessage("Loading assets...");
    try {
      console.log("Loading assets for currentUser:", currentUser);
      // Create an instance of AssetManager
      const actor = await createAssetActor();
      // Retrieve the list of assets from the actor
      const list = await actor.list();
      console.log("Received asset list:", list);
      // Filter assets based on showUserFiles state
      const filteredList = showUserFiles
        ? list.filter((file) =>
            file.key.startsWith(`/${currentUser?.principal}/`)
          )
        : list;
      console.log("Filtered asset list:", filteredList);
      // Set the assets state with the filtered list
      setAssets(
        filteredList.map((file) => ({
          key: file.key,
          url: `https://${canisterId}.raw.icp0.io/${file.key.slice(1)}`, // Update the URL with the Canister ID from the config file
        }))
      );
      console.log("Assets set:", assets);
      // Reset error state
      setError(null);
    } catch (err) {
      console.error("Failed to load assets:", err);
      setError("Failed to load assets.");
    } finally {
      // Set globalLoading state to false after completing the operation
      setGlobalLoading(false);
    }
  }, [createAssetActor, currentUser, showUserFiles]);

  // Function to handle asset deletion
  const handleDeleteAsset = useCallback(
    async (asset: Asset) => {
      if (!asset) return;
      setGlobalLoading(true);
      setLoadingMessage("Deleting asset...");
      try {
        console.log("Deleting asset:", asset);
        // Create an instance of AssetManager
        const actor = await createAssetActor();
        // Delete the specified asset
        await actor.delete(asset.key);
        // Reload the list of assets
        await loadList();
        // Reset confirmDelete state
        setConfirmDelete(null);
      } catch (err) {
        console.error("Failed to delete asset:", err);
        setError(`Failed to delete asset: ${asset.key}`);
        setConfirmDelete(null);
      } finally {
        // Set globalLoading state to false after completing the operation
        setGlobalLoading(false);
      }
    },
    [createAssetActor, loadList]
  );

  // Function to handle file upload
  const handleFileUpload = useCallback(
    async (file: File, principal: string) => {
      if (!principal) {
        const errorMessage = "User not authenticated.";
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }

      setGlobalLoading(true);
      setLoadingMessage("Uploading file...");
      try {
        console.log("Uploading file:", file);
        // Create an instance of AssetManager
        const actor = await createAssetActor();
        // Generate a key for the uploaded file
        const key = `${principal}/${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        // Store the file using AssetManager
        await actor.store(uint8Array, { fileName: key });
        // Reload the list of assets
        await loadList();
      } catch (err) {
        console.error("Failed to upload file:", err);
        setError("Failed to upload file.");
      } finally {
        // Set globalLoading state to false after completing the operation
        setGlobalLoading(false);
      }
    },
    [createAssetActor, loadList]
  );

  // Function to toggle the showUserFiles state
  const toggleUserFiles = useCallback(() => {
    setShowUserFiles((prevState) => !prevState);
  }, []);

  // Effect to load the list of assets when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  }, [currentUser, loadList]);

  // Return the required state variables and functions
  return {
    assets,
    globalLoading,
    loadingMessage,
    error,
    setError,
    confirmDelete,
    setConfirmDelete,
    loadList,
    handleDeleteAsset,
    handleFileUpload,
    showUserFiles,
    toggleUserFiles,
  };
}