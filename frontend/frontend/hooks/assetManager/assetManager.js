// useAssetManager.ts
import { useCallback, useEffect } from "react";
import { AssetManager } from "@dfinity/assets";
import { canisterId } from "../../configs/config";
import { useStore } from "../../store/store";

function useAssetManager(currentUser, bucketName) {
  // Create an AssetManager instance
  const createAssetManager = useCallback(async () => {
    console.log("Creating Asset Manager...");
    if (!currentUser || !bucketName) {
      throw new Error("CurrentUser or bucketName is not set.");
    }
    return new AssetManager({
      agent: currentUser.agent,
      canisterId,
    });
  }, [currentUser, bucketName]);

  // Zustand Store State
  const {
    assets,
    setAssets,
    showUserFiles,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    setError,
    confirmDelete,
    setConfirmDelete,
  } = useStore();

  // Generic function to handle API requests
  const handleApiRequest = useCallback(
    async (requestFunction, loadingMessage) => {
      console.log("Handling API request...");
      try {
        setIsLoading(true);
        setLoadingMessage(loadingMessage);
        await requestFunction();
        console.log("API Request succeeded.");
        setError(null);
      } catch (err) {
        console.error("API Request failed:", err);
        setError("Operation failed.");
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    },
    [setIsLoading, setLoadingMessage, setError]
  );

  // Load the list of assets
  const loadAssetList = useCallback(async () => {
    console.log("Loading asset list...");
    await handleApiRequest(async () => {
      console.log("Fetching assets...");
      const assetManager = await createAssetManager();
      const list = await assetManager.list();
      const filteredList = showUserFiles
        ? list.filter((file) => file.key.startsWith(`${currentUser?.principal}`))
        : list;
      console.log("Assets fetched successfully.");
      setAssets(
        filteredList.map((file) => ({
          key: file.key,
          url: `https://${canisterId}.raw.icp0.io/${file.key.slice(1)}`,
        }))
      );
    }, "Loading assets...");
  }, [createAssetManager, currentUser, showUserFiles, handleApiRequest, setAssets]);

  // Delete an asset
  const handleDeleteAsset = useCallback(
    async (asset) => {
      console.log("Deleting asset...");
      if (!asset) return;
      await handleApiRequest(async () => {
        const assetManager = await createAssetManager();
        await assetManager.delete(asset.key);
        await loadAssetList();
        setConfirmDelete(null);
        console.log("Asset deleted successfully.");
      }, "Deleting asset...");
    },
    [createAssetManager, loadAssetList, handleApiRequest, setConfirmDelete]
  );

  // Upload a file
  const handleFileUpload = useCallback(
    async (file, principal) => {
      console.log("Uploading file...");
      if (!principal) {
        setError("User not authenticated.");
        return;
      }

      await handleApiRequest(async () => {
        const assetManager = await createAssetManager();

        // Determine the correct bucket based on the file type
        let bucketPath;
        if (file.type.startsWith("image/")) {
          bucketPath = "image-store";
        } else if (file.type === "application/json") {
          bucketPath = "data-store";
        } else if (file.type === "application/pdf" || file.type === "text/plain") {
          bucketPath = "document-store"; // Updated to support PDFs and text files
        } else {
          setError("Unsupported file type.");
          return;
        }

        // Construct the key using the bucket path
        const key = `${principal}/${bucketPath}/${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Store the file using the AssetManager
        await assetManager.store(uint8Array, { fileName: key });
        await loadAssetList();
        console.log("File uploaded successfully.");
      }, "Uploading file...");
    },
    [createAssetManager, loadAssetList, handleApiRequest, setError]
  );

  // Toggle visibility of user files
  const toggleUserFiles = useCallback(() => {
    console.log("Toggling user files visibility...");
    useStore.setState((state) => ({ showUserFiles: !state.showUserFiles }));
  }, []);

  // Effect to load asset list when the component mounts
  useEffect(() => {
    console.log("Effect: Loading asset list...");
    if (currentUser) {
      loadAssetList();
    }
  }, [currentUser, loadAssetList]);

  // Return the hook's API
  return {
    assets,
    isLoading,
    loadingMessage,
    error,
    setError,
    confirmDelete,
    setConfirmDelete,
    loadAssetList,
    handleDeleteAsset,
    handleFileUpload,
    showUserFiles,
    toggleUserFiles,
  };
}

export { useAssetManager };