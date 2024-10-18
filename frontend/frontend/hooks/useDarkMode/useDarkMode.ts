// useDarkMode.ts
import { useEffect } from 'react';
import { useStore } from '../../store/store'; // Adjust the path as necessary

const useDarkMode = () => {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);

  useEffect(() => {
    // Apply or remove the dark-mode class based on isDarkMode
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};

export default useDarkMode;
