// useAssetManager.d.ts
import { HttpAgent } from "@dfinity/agent";

export interface Asset {
  key: string;
  url: string;
}

// Declaration of UserObject to be returned to the parent frontend
export type UserObject = {
  principal: string;
  agent: HttpAgent | Actor | undefined;
  provider?: string; // Make provider optional
};

export function useAssetManager(
  currentUser: UserObject | null,
  bucketName: string | null
): {
  assets: Asset[];
  globalLoading: boolean;
  loadingMessage: string;
  error: string | null;
  setError: (error: string | null) => void;
  confirmDelete: Asset | null;
  setConfirmDelete: (confirmDelete: Asset | null) => void;
  loadAssetList: () => void; // Make sure loadList is defined
  handleDeleteAsset: (asset: Asset) => void;
  handleFileUpload: (file: File, principal: string) => void;
  showUserFiles: boolean;
  toggleUserFiles: () => void;
};

export { Asset, UserObject };