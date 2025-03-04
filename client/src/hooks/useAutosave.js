import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for autosaving form data
 * @param {Object} options - Configuration options
 * @param {Function} options.onSave - Function to call when saving
 * @param {Object} options.data - Data to save
 * @param {number} options.interval - Autosave interval in milliseconds
 * @param {boolean} options.enabled - Whether autosave is enabled
 * @param {Function} options.shouldSave - Function to determine if save should occur
 * @returns {Object} Autosave state and controls
 */
const useAutosave = ({
  onSave,
  data,
  interval = 30000, // Default: 30 seconds
  enabled = true,
  shouldSave = () => true
}) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(enabled);
  const timerRef = useRef(null);
  const lastDataRef = useRef(data);

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    return JSON.stringify(lastDataRef.current) !== JSON.stringify(data);
  }, [data]);

  // Save function
  const save = useCallback(async () => {
    if (!onSave || !hasDataChanged() || !shouldSave()) {
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(data);
      setLastSaved(new Date());
      lastDataRef.current = data;
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, hasDataChanged, onSave, shouldSave]);

  // Set up autosave timer
  useEffect(() => {
    if (isAutosaveEnabled) {
      timerRef.current = setInterval(save, interval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, isAutosaveEnabled, save]);

  // Toggle autosave
  const toggleAutosave = useCallback(() => {
    setIsAutosaveEnabled(prev => !prev);
  }, []);

  // Manual save
  const saveNow = useCallback(async () => {
    return await save();
  }, [save]);

  return {
    lastSaved,
    isSaving,
    error,
    isAutosaveEnabled,
    toggleAutosave,
    saveNow
  };
};

export default useAutosave; 