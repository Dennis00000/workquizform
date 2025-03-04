import React from 'react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Autosave indicator component
 * @param {Object} props - Component props
 * @param {Date} props.lastSaved - Last saved timestamp
 * @param {boolean} props.isSaving - Whether a save is in progress
 * @param {Error} props.error - Save error, if any
 * @param {boolean} props.isEnabled - Whether autosave is enabled
 * @param {Function} props.onToggle - Function to toggle autosave
 * @param {Function} props.onManualSave - Function to trigger manual save
 */
const AutosaveIndicator = ({
  lastSaved,
  isSaving,
  error,
  isEnabled,
  onToggle,
  onManualSave
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center">
        <label htmlFor="autosave-toggle" className="mr-2 text-gray-600">
          Autosave
        </label>
        <div className="relative inline-block w-10 align-middle select-none">
          <input
            type="checkbox"
            id="autosave-toggle"
            checked={isEnabled}
            onChange={onToggle}
            className="sr-only"
          />
          <div className={`block w-10 h-6 rounded-full ${isEnabled ? 'bg-indigo-400' : 'bg-gray-300'}`}></div>
          <div
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              isEnabled ? 'transform translate-x-4' : ''
            }`}
          ></div>
        </div>
      </div>

      <button
        onClick={onManualSave}
        disabled={isSaving}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
      >
        Save now
      </button>

      <div className="text-gray-500">
        {isSaving ? (
          <span className="text-indigo-500">Saving...</span>
        ) : error ? (
          <span className="text-red-500">Save failed</span>
        ) : lastSaved ? (
          <span>
            Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </span>
        ) : (
          <span>Not saved yet</span>
        )}
      </div>
    </div>
  );
};

export default AutosaveIndicator; 