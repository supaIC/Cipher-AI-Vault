// useAssetManager.ts
import { useCallback, useState, useEffect } from "react";
import { HttpAgent } from "@dfinity/agent";
import { AssetManager } from "@dfinity/assets";
import { UserObject } from "./walletFunctions";

export interface Asset {
  key: string;
  url: string;
}

export function useAssetManager(
    currentUser: UserObject | null,
    bucketName: string | null
  ) {
    const [showUserFiles, setShowUserFiles] = useState<boolean>(false);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
  
    const createAssetActor = useCallback(async (): Promise<AssetManager> => {
      if (!currentUser || !bucketName) {
        const errorMessage = "CurrentUser or bucketName is not set.";
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      console.log("Creating AssetManager with currentUser:", currentUser);
      console.log("Bucket name:", bucketName);
      return new AssetManager({
        agent: currentUser.agent as HttpAgent,
        canisterId: "zks6t-giaaa-aaaap-qb7fa-cai",
      });
    }, [currentUser, bucketName]);
  
    const loadList = useCallback(async () => {
      setGlobalLoading(true);
      setLoadingMessage("Loading assets...");
      try {
        console.log("Loading assets for currentUser:", currentUser);
        const actor = await createAssetActor();
        const list = await actor.list();
        console.log("Received asset list:", list);
        const filteredList = showUserFiles
          ? list.filter((file) =>
              file.key.startsWith(`/${currentUser?.principal}/`)
            )
          : list;
        console.log("Filtered asset list:", filteredList);
        setAssets(
          filteredList.map((file) => ({
            key: file.key,
            url: `https://zks6t-giaaa-aaaap-qb7fa-cai.raw.icp0.io/${file.key.slice(
              1
            )}`,
          }))
        );
        console.log("Assets set:", assets);
        setError(null);
      } catch (err) {
        console.error("Failed to load assets:", err);
        setError("Failed to load assets.");
      } finally {
        setGlobalLoading(false);
      }
    }, [createAssetActor, currentUser, showUserFiles]);
  
    const handleDeleteAsset = useCallback(async (asset: Asset) => {
      if (!asset) return;
      setGlobalLoading(true);
      setLoadingMessage("Deleting asset...");
      try {
        console.log("Deleting asset:", asset);
        const actor = await createAssetActor();
        await actor.delete(asset.key);
        await loadList();
        setConfirmDelete(null);
      } catch (err) {
        console.error("Failed to delete asset:", err);
        setError(`Failed to delete asset: ${asset.key}`);
        setConfirmDelete(null);
      } finally {
        setGlobalLoading(false);
      }
    }, [createAssetActor, loadList]);
  
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
          const actor = await createAssetActor();
          const key = `${principal}/${file.name}`;
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          await actor.store(uint8Array, { fileName: key });
          await loadList();
        } catch (err) {
          console.error("Failed to upload file:", err);
          setError("Failed to upload file.");
        } finally {
          setGlobalLoading(false);
        }
      },
      [createAssetActor, loadList]
    );
  
    const toggleUserFiles = useCallback(() => {
      setShowUserFiles((prevState) => !prevState);
    }, []);
  
    useEffect(() => {
      if (currentUser) {
        loadList();
      }
    }, [currentUser, loadList]);
  
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
  