// store.ts
import { create } from 'zustand';
import { SetStateAction, Dispatch } from 'react';
import { Asset } from "../hooks/assetManager/assetManager";
import { Types } from "ic-auth";
import * as data from '../hooks/dataManager/dataManager';
import { UserObject } from '../hooks/assetManager/assetManager'; // Ensure correct path

interface StoreState {
  // State Variables
  hoveredAsset: Asset | null;
  tooltipPosition: { x: number; y: number };
  activeSection: string;
  privateData: data.FullDataQuery | null;
  statusMessage: string;
  status: string | null;
  loadingMessage: string;
  progressItems: any[];
  isRunning: boolean;
  selectedModel: string;
  loadedModels: Set<string>;
  searchQuery: string;
  recentSearches: string[];
  isMenuOpen: boolean;
  tooltipContent: string | null;
  showUserFiles: boolean;
  
  // Authentication State
  currentUser: UserObject | null;

  // CopyToClipboard State
  copySuccess: string | null;

  // Actions
  setHoveredAsset: Dispatch<SetStateAction<Asset | null>>;
  setTooltipPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
  setActiveSection: Dispatch<SetStateAction<string>>;
  setPrivateData: Dispatch<SetStateAction<data.FullDataQuery | null>>;
  setStatusMessage: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string | null>>;
  setLoadingMessage: Dispatch<SetStateAction<string>>;
  setProgressItems: Dispatch<SetStateAction<any[]>>;
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setSelectedModel: Dispatch<SetStateAction<string>>;
  setLoadedModels: Dispatch<SetStateAction<Set<string>>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setRecentSearches: Dispatch<SetStateAction<string[]>>;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  setTooltipContent: Dispatch<SetStateAction<string | null>>;
  setShowUserFiles: Dispatch<SetStateAction<boolean>>;
  setCurrentUser: Dispatch<SetStateAction<UserObject | null>>;
  setCopySuccess: Dispatch<SetStateAction<string | null>>;

  // Additional Actions
  addRecentSearch: (query: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial State
  hoveredAsset: null,
  tooltipPosition: { x: 0, y: 0 },
  activeSection: 'Dashboard',
  privateData: null,
  statusMessage: '',
  status: null,
  loadingMessage: '',
  progressItems: [],
  isRunning: false,
  selectedModel: '',
  loadedModels: new Set(),
  searchQuery: '',
  recentSearches: [],
  isMenuOpen: false,
  tooltipContent: null,
  showUserFiles: false,
  currentUser: null, // Initialize as null
  copySuccess: null, // Initialize as null

  // Actions
  setHoveredAsset: (value) => set((state) => ({
    hoveredAsset: typeof value === 'function' ? (value as (prev: Asset | null) => Asset | null)(state.hoveredAsset) : value
  })),

  setTooltipPosition: (value) => set((state) => ({
    tooltipPosition: typeof value === 'function' ? (value as (prev: { x: number; y: number }) => { x: number; y: number })(state.tooltipPosition) : value
  })),

  setActiveSection: (value) => set((state) => ({
    activeSection: typeof value === 'function' ? (value as (prev: string) => string)(state.activeSection) : value
  })),

  setPrivateData: (value) => set((state) => ({
    privateData: typeof value === 'function' ? (value as (prev: data.FullDataQuery | null) => data.FullDataQuery | null)(state.privateData) : value
  })),

  setStatusMessage: (value) => set((state) => ({
    statusMessage: typeof value === 'function' ? (value as (prev: string) => string)(state.statusMessage) : value
  })),

  setStatus: (value) => set((state) => ({
    status: typeof value === 'function' ? (value as (prev: string | null) => string | null)(state.status) : value
  })),

  setLoadingMessage: (value) => set((state) => ({
    loadingMessage: typeof value === 'function' ? (value as (prev: string) => string)(state.loadingMessage) : value
  })),

  setProgressItems: (value) => set((state) => ({
    progressItems: typeof value === 'function' ? (value as (prev: any[]) => any[])(state.progressItems) : value
  })),

  setIsRunning: (value) => set((state) => ({
    isRunning: typeof value === 'function' ? (value as (prev: boolean) => boolean)(state.isRunning) : value
  })),

  setSelectedModel: (value) => set((state) => ({
    selectedModel: typeof value === 'function' ? (value as (prev: string) => string)(state.selectedModel) : value
  })),

  setLoadedModels: (value) => set((state) => ({
    loadedModels: typeof value === 'function' ? (value as (prev: Set<string>) => Set<string>)(state.loadedModels) : value
  })),

  setSearchQuery: (value) => set((state) => ({
    searchQuery: typeof value === 'function' ? (value as (prev: string) => string)(state.searchQuery) : value
  })),

  setRecentSearches: (value) => set((state) => ({
    recentSearches: typeof value === 'function' ? (value as (prev: string[]) => string[])(state.recentSearches) : value
  })),

  setIsMenuOpen: (value) => set((state) => ({
    isMenuOpen: typeof value === 'function' ? (value as (prev: boolean) => boolean)(state.isMenuOpen) : value
  })),

  setTooltipContent: (value) => set((state) => ({
    tooltipContent: typeof value === 'function' ? (value as (prev: string | null) => string | null)(state.tooltipContent) : value
  })),

  setShowUserFiles: (value) => set((state) => ({
    showUserFiles: typeof value === 'function' ? (value as (prev: boolean) => boolean)(state.showUserFiles) : value
  })),

  setCurrentUser: (value) => set((state) => ({
    currentUser: typeof value === 'function' ? (value as (prev: UserObject | null) => UserObject | null)(state.currentUser) : value
  })),

  setCopySuccess: (value) => set((state) => ({
    copySuccess: typeof value === 'function' ? (value as (prev: string | null) => string | null)(state.copySuccess) : value
  })),

  // Additional Actions
  addRecentSearch: (query) => set((state) => ({
    recentSearches: [query, ...state.recentSearches.filter(item => item !== query)].slice(0, 5),
  })),
}));
