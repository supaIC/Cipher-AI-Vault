// TODO: Modularize the AssetManager and Canister Top-up features into their own hooks

// Importing React and necessary hooks for component functionality.
import React, { useEffect, useState, useCallback } from "react";

// Importing IC agent and asset manager for interacting with the Internet Computer.
import { HttpAgent, Actor } from "@dfinity/agent";
import { AssetManager } from "@dfinity/assets";

// Importing stylesheet for styling the component.
import "./styles/index.css";

// Importing custom components used within the parent component.
import UploadButton from "./components/UploadButton";
import {
  LoadingOverlay,
  ErrorNotification,
  DeleteConfirmation,
} from "./components/OverlayComponents";
import AssetView from "./components/AssetView";
import AssetListItem from "./components/AssetListItem";
import ToggleButton from "./components/ToggleButton";
import { ICWalletList } from "./components/ICWalletList";

// Importing hooks for wallet functions.
import { UserObject } from "./hooks/walletFunctions";

// Importing interfaces for cycles top-up feature..
import * as cycles from "./interfaces/cmc/cmc";
import * as ledger from "./interfaces/ledger/index";
import * as distro from "./interfaces/distro/index";

// Defining the Asset type for managing asset data.
interface Asset {
  key: string;
  url: string;
}

/**
 * The Parent component orchestrates the functionality for uploading, viewing,
 * and managing assets on the Internet Computer. It integrates with the IC's
 * AssetManager for handling asset operations and utilizes custom hooks and
 * components for a seamless user experience.
 */
export function Parent() {
  // State hooks for managing component state.
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    top: number;
  }>({ left: 0, top: 0 });
  const [bucketName, setBucketName] = useState<string | null>(null);
  const [showUserFiles, setShowUserFiles] = useState<boolean>(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

  // Defining callback functions to interact with the Internet Computer (IC) and manage asset operations.

  /**
   * Callback to set the current user's information in the parent component's state.
   * This function is crucial for passing authenticated user data (principal, agent, provider)
   * from child components or authentication logic up to the parent component.
   */
  const giveToParent = useCallback(
    (principal: string, agent: HttpAgent, provider: string) => {
      setCurrentUser({ principal, agent, provider }); // Sets the current user's data.
      setBucketName(principal); // Uses the principal as the bucket name for asset storage.
    },
    [] // This callback does not depend on any changing state or props.
  );

  /**
   * Asynchronously creates an instance of the AssetManager to interact with IC canisters.
   * This is essential for performing asset operations such as listing, uploading, and deleting assets.
   * Throws an error if the current user or bucket name is not set, ensuring that the asset manager
   * can only be created when necessary user information is available.
   */
  const createAssetActor = useCallback(async (): Promise<AssetManager> => {
    if (!currentUser || !bucketName)
      throw new Error("CurrentUser or bucketName is not set.");
    return new AssetManager({
      agent: currentUser.agent as HttpAgent, // The authenticated user's agent.
      canisterId: "zks6t-giaaa-aaaap-qb7fa-cai", // The canister ID for asset management.
    });
  }, [currentUser, bucketName]); // Depends on the currentUser and bucketName state.

  /**
   * Asynchronously loads the list of assets from the IC.
   * This function fetches the asset list using the AssetManager, filters it if necessary
   * (based on whether the user wants to see only their files), and updates the state with the loaded assets.
   * It handles loading state and potential errors during the asset loading process.
   */
  const loadList = useCallback(async () => {
    setGlobalLoading(true);
    setLoadingMessage("Loading assets...");
    try {
      const actor = await createAssetActor();
      const list = await actor.list();
      const filteredList = showUserFiles
        ? list.filter((file) =>
          file.key.startsWith(`/${currentUser?.principal}/`)
        )
        : list;
      setAssets(
        filteredList.map((file) => ({
          key: file.key,
          url: `https://zks6t-giaaa-aaaap-qb7fa-cai.raw.icp0.io/${file.key.slice(
            1
          )}`,
        }))
      );
      setError(null);
    } catch (err) {
      setError("Failed to load assets.");
    } finally {
      setGlobalLoading(false);
    }
  }, [createAssetActor, currentUser, showUserFiles]); // Depends on the createAssetActor, currentUser state, and whether to show user files.

  /**
   * Handles the deletion of an asset.
   * This function is called when a user confirms the deletion of a specific asset.
   * It sets the loading state, attempts to delete the asset using the AssetManager, refreshes the asset list,
   * and handles any errors that occur during the deletion process.
   */
  const handleDeleteAsset = useCallback(async () => {
    if (!confirmDelete) return;
    setGlobalLoading(true);
    setLoadingMessage("Deleting asset...");
    try {
      const actor = await createAssetActor();
      await actor.delete(confirmDelete.key);
      await loadList();
      setConfirmDelete(null);
    } catch (err) {
      setError(`Failed to delete asset: ${confirmDelete.key}`);
      setConfirmDelete(null);
    } finally {
      setGlobalLoading(false);
    }
  }, [confirmDelete, createAssetActor, loadList]); // Depends on the confirmDelete state, createAssetActor, and the loadList function.

  /**
   * Handles the upload of a file.
   * This function is triggered when a user selects a file to upload. It checks for user authentication,
   * sets the loading state, attempts to upload the file using the AssetManager, and handles any errors
   * that occur during the upload process.
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!currentUser || !currentUser.principal) {
        setError("User not authenticated.");
        return;
      }

      setGlobalLoading(true);
      setLoadingMessage("Uploading file...");
      try {
        const actor = await createAssetActor();
        const key = `${currentUser.principal}/${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await actor.store(uint8Array, { fileName: key });
        await loadList();
      } catch (err) {
        setError("Failed to upload file.");
      } finally {
        setGlobalLoading(false);
      }
    },
    [currentUser, createAssetActor, loadList]
  ); // Depends on the currentUser state, createAssetActor, and the loadList function.

  // Define a whitelist of canister IDs for security purposes
  const whitelist: Array<string> = [
    "zks6t-giaaa-aaaap-qb7fa-cai",
    "jeb4e-myaaa-aaaak-aflga-cai",
  ];

  // Function to create actors for interacting with various canisters
  const createActors = async () => {
    // Create actors for cycles, ledger, and distro canisters
    const cyclesActor = Actor.createActor(cycles.idlFactory, {
      agent: currentUser!.agent as HttpAgent,
      canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai", // Canister ID for cycles actor
    });
    const ledgerActor = Actor.createActor(ledger.idlFactory, {
      agent: currentUser!.agent as HttpAgent,
      canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai", // Canister ID for ledger actor
    });
    const distroActor = Actor.createActor(distro.idlFactory, {
      agent: currentUser!.agent as HttpAgent,
      canisterId: "jeb4e-myaaa-aaaak-aflga-cai", // Canister ID for distro actor
    });

    return {
      cycles: cyclesActor,
      ledger: ledgerActor,
      distro: distroActor,
    };
  };

  // Function to verify a transaction on the ledger
  const verifyTransaction = async (
    block_height: number,
    amount_sent: number,
    actor: any
  ) => {
    // Create a basic HTTP agent
    const basicAgent = new HttpAgent({ host: "https://ic0.app" });
    const ledgerActor = actor;

    // Query the ledger for transaction details
    const result: any = await ledgerActor.query_blocks({
      start: block_height,
      length: 1,
    });
    console.log("The result of the query is: ", result);

    // Extract transfer information from the transaction
    const transferInfo = result!.blocks[0].transaction.operation[0].Transfer;
    console.log("The transfer info is: ", transferInfo);

    // Parse transferred amount from the transaction
    const transferredAmount = Number(transferInfo.amount.e8s);
    console.log("The transferred amount is: ", transferredAmount);

    // Verify if transferred amount matches the expected amount
    if (transferredAmount === amount_sent) {
      return true; // Transaction verified
    } else {
      return false; // Transaction not verified
    }
  };

  // Main function to handle the cycles top-up process
  const cyclesTopUp = async () => {
    // Create actors for interacting with canisters
    const actors = await createActors();

    // Convert ICP to cycles
    console.log("Converting rate...");
    const conversionRate: any =
      await actors.cycles.get_icp_xdr_conversion_rate();
    const actualRate = conversionRate.data.xdr_permyriad_per_icp.toString();
    const requiredZeros = "00000000";
    const finalRate = Number(actualRate + requiredZeros);

    // Calculate amount of cycles to top up
    const amountOfICP = 0.01;
    const amountInXDR = amountOfICP * finalRate;
    console.log("The amount in XDR is: ", amountInXDR);

    // Initiate payment using the Plug Wallet
    console.log("Handling plug payment...");
    const to =
      "7zdi6-6h2gk-g4j54-cigti-iiu4u-lj4vy-bewjf-oouoc-dnlck-fyfy5-aae";
    const amount = amountOfICP * 100000000;
    console.log(amount);
    const memo = "Testing";
    const result = await (window as any).ic.plug.requestTransfer({
      to,
      amount,
      memo,
    });
    console.log("The result of the transfer is: ", result);

    // Verify the transaction on the ledger
    console.log("Verifying the transaction...");
    const verified = await verifyTransaction(
      result.height,
      amount,
      actors.ledger
    );
    if (verified) {
      console.log("The transaction was verified!");
    } else {
      console.log("The transaction was not verified!");
      return;
    }

    // Add cycles to all canisters
    console.log("Adding cycles...");
    const balancesBefore = await actors.distro.getBalances();
    console.log("The current balances of the canisters are: ", balancesBefore);
    const topupResult = await actors.distro.addCyclesToAll(amountInXDR);
    console.log("The result of the topup is: ", topupResult);
    const balancesAfter = await actors.distro.getBalances();
    console.log("The new balances of the canisters are: ", balancesAfter);
  };

  // Effect hook for loading assets when the current user is set.
  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  }, [currentUser, loadList]);

  // Event handlers for drag-and-drop functionality.
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      setDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.relatedTarget || e.relatedTarget === document.body) {
      setDragging(false);
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragging(false);
  }, []);

  // Callbacks for managing asset view and user file toggle.
  const openAssetView = useCallback((asset: Asset) => {
    setViewingAsset(asset);
  }, []);

  const closeAssetView = useCallback(() => {
    setViewingAsset(null);
  }, []);

  const toggleUserFiles = useCallback(() => {
    setShowUserFiles((prevState) => !prevState);
  }, []);

  // Render the component UI.
  return (
    <div
      className="app"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileUpload(file);
        }
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Donate Cycles Button */}
      {currentUser && (
        <button
          onClick={cyclesTopUp}
          style={{
            position: "absolute",
            top: "44px",
            left: "37%",
            zIndex: 9,
          }}
        >
          Donate Cycles
        </button>
      )}

      {globalLoading && <LoadingOverlay message={loadingMessage} />}
      {error && (
        <ErrorNotification message={error} onClose={() => setError(null)} />
      )}
      {confirmDelete && (
        <DeleteConfirmation
          asset={confirmDelete}
          onConfirm={handleDeleteAsset}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {!currentUser ? (
        <ICWalletList
          giveToParent={giveToParent}
          whitelist={[
            "zks6t-giaaa-aaaap-qb7fa-cai",
            "jeb4e-myaaa-aaaak-aflga-cai",
          ]}
        />
      ) : (
        <>
          <UploadButton onUpload={handleFileUpload} disabled={globalLoading} />
          <ToggleButton
            label="Show Only My Files"
            checked={showUserFiles}
            onChange={toggleUserFiles}
          />
          <div className={`assets-container ${dragging ? "dragging" : ""}`}>
            {dragging && (
              <div className="overlay">Drop file here to upload</div>
            )}
            <div className="logged-in-info">
              Logged in as: {currentUser.principal}
            </div>
            {assets.map((asset) => (
              <AssetListItem
                key={asset.key}
                asset={asset}
                onMouseEnter={() => setHoveredAsset(asset)}
                onMouseLeave={() => setHoveredAsset(null)}
                onClick={() => openAssetView(asset)}
              />
            ))}
            {hoveredAsset && (
              <div
                className="tooltip"
                style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
              >
                <p>URL: {hoveredAsset.url}</p>
              </div>
            )}
          </div>
          {viewingAsset && (
            <AssetView
              asset={viewingAsset}
              onClose={closeAssetView}
              onDelete={() => {
                setConfirmDelete(viewingAsset);
                setViewingAsset(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
