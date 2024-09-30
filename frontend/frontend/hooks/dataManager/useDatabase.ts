import { useState, useCallback } from 'react';
import { getEmbedding, EmbeddingIndex, initializeModel } from '../client-vector-search/src/index';

interface SearchResult {
  input: string;
  similarity: number;
  object: {
    name: string;
    description: string;
  };
}

interface UseDatabaseOptions {
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  log: (message: string) => void;
  addRecentSearch: (query: string) => void;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
  publicJsonAssets: any[];
  privateJsonAssets: any[];
  isMounted: React.MutableRefObject<boolean>;
}

const useDatabase = ({
  isRunning,
  setIsRunning,
  log,
  addRecentSearch,
  setStatusMessage,
  publicJsonAssets,
  privateJsonAssets,
  isMounted,
}: UseDatabaseOptions) => {
  const [index, setIndex] = useState<EmbeddingIndex | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<'public' | 'private'>('public');

  const initializeDB = useCallback(async () => {
    if (isRunning || !selectedFile) return;

    setIsRunning(true);
    try {
      log('Initializing database...');
      setStatusMessage('Initializing database...');

      let initialObjects;

      if (selectedFileType === 'public') {
        const selectedAsset = publicJsonAssets.find((asset) => asset.key.endsWith(selectedFile));
        if (!selectedAsset) {
          throw new Error(`Selected public file not found: ${selectedFile}`);
        }
        const response = await fetch(selectedAsset.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch public data: ${response.statusText}`);
        }
        initialObjects = await response.json();
      } else {
        const selectedPrivateFile = privateJsonAssets.find((file) => file.fileName === selectedFile);
        if (!selectedPrivateFile) {
          throw new Error(`Selected private file not found: ${selectedFile}`);
        }
        initialObjects = selectedPrivateFile.fileData;
      }

      if (!Array.isArray(initialObjects)) {
        throw new Error('The fetched data is not an array');
      }

      log('Initializing the model...');
      setStatusMessage('Initializing the model...');
      await initializeModel();
      log('Model initialized successfully.');
      setStatusMessage('Model initialized successfully.');

      setStatusMessage('Creating embeddings...');
      for (const obj of initialObjects) {
        if (obj.description) {
          obj.embedding = await getEmbedding(obj.description);
        } else {
          console.warn(`Object with id ${obj.id} has no description, skipping embedding.`);
        }
      }

      log('Embeddings created successfully.');
      setStatusMessage('Embeddings created successfully.');

      const newIndex = new EmbeddingIndex(initialObjects);
      await newIndex.saveIndex('indexedDB');
      setIndex(newIndex);

      log('Database initialized successfully.');
      setStatusMessage('Database initialized successfully.');
    } catch (error) {
      log('Error initializing database.');
      if (isMounted.current) {
        setStatusMessage('Error initializing database.');
      }

      if (error instanceof Error) {
        console.error('Error initializing the database:', error.message);
      } else {
        console.error('Unknown error occurred during database initialization:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsRunning(false);
      }
    }
  }, [
    isRunning,
    selectedFile,
    selectedFileType,
    publicJsonAssets,
    privateJsonAssets,
    setIsRunning,
    log,
    setStatusMessage,
    isMounted,
  ]);

  const handleSearch = useCallback(
    async (searchQuery: string): Promise<SearchResult[]> => {
      if (isRunning || !index) return [];

      setIsRunning(true);
      try {
        log(`Initiating search for: "${searchQuery}"...`);
        setStatusMessage(`Searching for: "${searchQuery}"...`);

        const queryEmbedding = await getEmbedding(searchQuery);

        // Perform the search and get raw results
        const rawResults = await index.search(queryEmbedding, { topK: 5, useStorage: 'indexedDB' });

        // Log raw results for debugging
        console.log('Raw Search Results:', rawResults);

        // Map the raw results to your SearchResult interface
        const results: SearchResult[] = rawResults.map((match: any) => ({
          input: match.id || '',
          similarity: match.similarity || 0, // Use similarity instead of distance
          object: {
            name: match.object?.name || '', // Safely access object properties
            description: match.object?.description || '',
          },
        }));

        if (isMounted.current) {
          setSearchResult(results || []);
          log(`Search completed for: "${searchQuery}".`);
          setStatusMessage(`Search completed for: "${searchQuery}".`);
          addRecentSearch(searchQuery);
        }

        return results;
      } catch (error) {
        log('Error performing search.');
        if (isMounted.current) {
          setStatusMessage('Error performing search.');
        }

        if (error instanceof Error) {
          console.error('Error performing search:', error.message);
        } else {
          console.error('Unknown error occurred:', error);
        }
        return [];
      } finally {
        if (isMounted.current) {
          setIsRunning(false);
        }
      }
    },
    [index, isRunning, addRecentSearch, log, setStatusMessage, isMounted, setIsRunning]
  );

  const clearDatabase = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      if (index) {
        await index.deleteIndexedDB();
        if (isMounted.current) {
          setIndex(null);
          setSearchResult([]);
          setStatusMessage('Database cleared successfully.');
          log('Database cleared successfully.');
        }
      } else {
        if (isMounted.current) {
          setStatusMessage('No database to clear.');
          log('No database to clear.');
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setStatusMessage('Error clearing database.');
      }
      console.error('Error clearing the database:', error);
    } finally {
      if (isMounted.current) {
        setIsRunning(false);
      }
    }
  }, [isRunning, index, log, setStatusMessage, isMounted, setIsRunning]);

  return {
    index,
    searchResult,
    selectedFile,
    setSelectedFile,
    selectedFileType,
    setSelectedFileType,
    initializeDB,
    handleSearch,
    clearDatabase,
  };
};

export default useDatabase;