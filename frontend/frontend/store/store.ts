// store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SetStateAction, Dispatch } from 'react';
import { Asset, UserObject } from '../hooks/assetManager/assetManager';
import * as data from '../hooks/dataManager/dataManager';
import { EmbeddingIndex } from '../hooks/client-vector-search/src/index';

// ===== INTERFACE =====

interface SearchResult {
  input: string;
  similarity: number;
  object: {
    name: string;
    description: string;
  };
}

interface StoreState {
  // ----- State Variables -----
  // UI State
  activeSection: string;
  isMenuOpen: boolean;
  isDarkMode: boolean;
  tooltipContent: string | null;
  tooltipPosition: { x: number; y: number };

  // Data State
  privateData: data.FullDataQuery | null;
  isRunning: boolean;

  // Search State
  searchQuery: string;
  recentSearches: string[];
  searchResult: SearchResult[];
  selectedFile: string;
  selectedFileType: 'public' | 'private';

  // Model State
  selectedModel: string;
  loadedModels: Set<string>;
  statusMessage: string;
  status: string | null;
  progressItems: any[];
  index: EmbeddingIndex | null;

  // Authentication State
  currentUser: UserObject | null;

  // Utility State
  copySuccess: string | null;

  // Loading State
  isLoading: boolean;
  loadingMessage: string;

  // Asset Management State
  assets: Asset[];
  hoveredAsset: Asset | null;
  showUserFiles: boolean;
  error: string | null;
  confirmDelete: Asset | null;

  // ----- Actions -----
  // UI Actions
  setActiveSection: Dispatch<SetStateAction<string>>;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  toggleDarkMode: () => void;
  setTooltipContent: Dispatch<SetStateAction<string | null>>;
  setTooltipPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;

  // Data Actions
  setPrivateData: Dispatch<SetStateAction<data.FullDataQuery | null>>;
  setIsRunning: Dispatch<SetStateAction<boolean>>;

  // Search Actions
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setRecentSearches: Dispatch<SetStateAction<string[]>>;
  addRecentSearch: (query: string) => void;
  setSearchResult: Dispatch<SetStateAction<SearchResult[]>>;
  setSelectedFile: Dispatch<SetStateAction<string>>;
  setSelectedFileType: Dispatch<SetStateAction<'public' | 'private'>>;

  // Model Actions
  setSelectedModel: Dispatch<SetStateAction<string>>;
  setLoadedModels: Dispatch<SetStateAction<Set<string>>>;
  setStatusMessage: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string | null>>;
  setProgressItems: Dispatch<SetStateAction<any[]>>;
  setIndex: Dispatch<SetStateAction<EmbeddingIndex | null>>;

  // Authentication Actions
  setCurrentUser: Dispatch<SetStateAction<UserObject | null>>;

  // Utility Actions
  setCopySuccess: Dispatch<SetStateAction<string | null>>;

  // Loading Actions
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setLoadingMessage: Dispatch<SetStateAction<string>>;

  // Asset Management Actions
  setAssets: (assets: Asset[]) => void;
  setHoveredAsset: Dispatch<SetStateAction<Asset | null>>;
  setShowUserFiles: Dispatch<SetStateAction<boolean>>;
  setError: (error: string | null) => void;
  setConfirmDelete: (asset: Asset | null) => void;
}

// ===== STORE CREATION =====

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ----- Initial State -----
      // UI Initial State
      activeSection: 'Dashboard',
      isMenuOpen: false,
      isDarkMode: true,
      tooltipContent: null,
      tooltipPosition: { x: 0, y: 0 },

      // Data Initial State
      privateData: null,
      isRunning: false,

      // Search Initial State
      searchQuery: '',
      recentSearches: [],
      searchResult: [],
      selectedFile: '',
      selectedFileType: 'public',

      // Model Initial State
      selectedModel: '',
      loadedModels: new Set(),
      statusMessage: '',
      status: null,
      progressItems: [],
      index: null,

      // Authentication Initial State
      currentUser: null,

      // Utility Initial State
      copySuccess: null,

      // Loading Initial State
      isLoading: false,
      loadingMessage: '',

      // Asset Management Initial State
      assets: [],
      hoveredAsset: null,
      showUserFiles: false,
      error: null,
      confirmDelete: null,

      // ----- Actions -----
      // UI Actions
      setActiveSection: (value) =>
        set((state) => ({
          activeSection:
            typeof value === 'function'
              ? (value as (prev: string) => string)(state.activeSection)
              : value,
        })),

      setIsMenuOpen: (value) =>
        set((state) => ({
          isMenuOpen:
            typeof value === 'function'
              ? (value as (prev: boolean) => boolean)(state.isMenuOpen)
              : value,
        })),

      setIsDarkMode: (value) =>
        set({
          isDarkMode:
            typeof value === 'function'
              ? (value as (prev: boolean) => boolean)(get().isDarkMode)
              : value,
        }),

      toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),

      setTooltipContent: (value) =>
        set((state) => ({
          tooltipContent:
            typeof value === 'function'
              ? (value as (prev: string | null) => string | null)(state.tooltipContent)
              : value,
        })),

      setTooltipPosition: (value) =>
        set((state) => ({
          tooltipPosition:
            typeof value === 'function'
              ? (value as (prev: { x: number; y: number }) => { x: number; y: number })(
                  state.tooltipPosition
                )
              : value,
        })),

      // Data Actions
      setPrivateData: (value) =>
        set((state) => ({
          privateData:
            typeof value === 'function'
              ? (value as (prev: data.FullDataQuery | null) => data.FullDataQuery | null)(
                  state.privateData
                )
              : value,
        })),

      setIsRunning: (value) =>
        set((state) => ({
          isRunning:
            typeof value === 'function'
              ? (value as (prev: boolean) => boolean)(state.isRunning)
              : value,
        })),

      // Search Actions
      setSearchQuery: (value) =>
        set((state) => ({
          searchQuery:
            typeof value === 'function'
              ? (value as (prev: string) => string)(state.searchQuery)
              : value,
        })),

      setRecentSearches: (value) =>
        set((state) => ({
          recentSearches:
            typeof value === 'function'
              ? (value as (prev: string[]) => string[])(state.recentSearches)
              : value,
        })),

      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [query, ...state.recentSearches.filter((item) => item !== query)].slice(
            0,
            5
          ),
        })),

      setSearchResult: (value) =>
        set((state) => ({
          searchResult:
            typeof value === 'function'
              ? (value as (prev: SearchResult[]) => SearchResult[])(state.searchResult)
              : value,
        })),

      setSelectedFile: (value) =>
        set((state) => ({
          selectedFile:
            typeof value === 'function'
              ? (value as (prev: string) => string)(state.selectedFile)
              : value,
        })),

      setSelectedFileType: (value) =>
        set((state) => ({
          selectedFileType:
            typeof value === 'function'
              ? (value as (prev: 'public' | 'private') => 'public' | 'private')(state.selectedFileType)
              : value,
        })),

      // Model Actions
      setSelectedModel: (value) =>
        set((state) => ({
          selectedModel:
            typeof value === 'function'
              ? (value as (prev: string) => string)(state.selectedModel)
              : value,
        })),

      setLoadedModels: (value) =>
        set((state) => ({
          loadedModels:
            typeof value === 'function'
              ? (value as (prev: Set<string>) => Set<string>)(state.loadedModels)
              : value,
        })),

      setStatusMessage: (value) =>
        set((state) => ({
          statusMessage:
            typeof value === 'function'
              ? (value as (prev: string) => string)(state.statusMessage)
              : value,
        })),

      setStatus: (value) =>
        set((state) => ({
          status:
            typeof value === 'function'
              ? (value as (prev: string | null) => string | null)(state.status)
              : value,
        })),

      setProgressItems: (value) =>
        set((state) => ({
          progressItems:
            typeof value === 'function'
              ? (value as (prev: any[]) => any[])(state.progressItems)
              : value,
        })),

      setIndex: (value) =>
        set((state) => ({
          index:
            typeof value === 'function'
              ? (value as (prev: EmbeddingIndex | null) => EmbeddingIndex | null)(state.index)
              : value,
        })),

      // Authentication Actions
      setCurrentUser: (value) =>
        set((state) => ({
          currentUser:
            typeof value === 'function'
              ? (value as (prev: UserObject | null) => UserObject | null)(state.currentUser)
              : value,
        })),

      // Utility Actions
      setCopySuccess: (value) =>
        set((state) => ({
          copySuccess:
            typeof value === 'function'
              ? (value as (prev: string | null) => string | null)(state.copySuccess)
              : value,
        })),

      // Loading Actions
      setIsLoading: (value) =>
        set((state) => ({
          isLoading:
            typeof value === 'function'
              ? (value as (prev: boolean) => boolean)(state.isLoading)
              : value,
        })),

      setLoadingMessage: (value) =>
        set((state) => ({
          loadingMessage:
            typeof value === 'function'
              ? (value as (prev: string) => string)(state.loadingMessage)
              : value,
        })),

      // Asset Management Actions
      setAssets: (assets) => set({ assets }),
      setHoveredAsset: (value) =>
        set((state) => ({
          hoveredAsset:
            typeof value === 'function'
              ? (value as (prev: Asset | null) => Asset | null)(state.hoveredAsset)
              : value,
        })),
      setShowUserFiles: (value) =>
        set((state) => ({
          showUserFiles:
            typeof value === 'function'
              ? (value as (prev: boolean) => boolean)(state.showUserFiles)
              : value,
        })),
      setError: (error) => set({ error }),
      setConfirmDelete: (asset) => set({ confirmDelete: asset }),
    }),
    {
      name: 'app-store', // Unique name for localStorage
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        assets: state.assets,
        showUserFiles: state.showUserFiles,
        isLoading: state.isLoading,
        loadingMessage: state.loadingMessage,
        error: state.error,
        confirmDelete: state.confirmDelete,
        selectedFile: state.selectedFile,
        selectedFileType: state.selectedFileType,
      }),
    }
  )
);
