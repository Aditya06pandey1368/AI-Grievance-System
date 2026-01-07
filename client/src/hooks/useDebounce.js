import { useState, useEffect } from 'react';

// Usage: const debouncedSearch = useDebounce(searchTerm, 500);
// Effect: Waits 500ms after typing stops before updating 'debouncedSearch'

export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timer if value changes (typing continues)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}