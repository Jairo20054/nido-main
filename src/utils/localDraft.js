// utils/localDraft.js
// Helpers for saving and loading drafts in localStorage

const DRAFT_KEY_PREFIX = 'hostOnboardingDraft_';

export const saveDraft = (selectionId, data) => {
  try {
    const key = `${DRAFT_KEY_PREFIX}${selectionId}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const loadDraft = (selectionId) => {
  try {
    const key = `${DRAFT_KEY_PREFIX}${selectionId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Optional: Check if draft is not too old (e.g., 24 hours)
      const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
      if (isRecent) {
        return parsed.data;
      } else {
        localStorage.removeItem(key); // Remove old draft
      }
    }
  } catch (error) {
    console.error('Error loading draft:', error);
  }
  return null;
};

export const clearDraft = (selectionId) => {
  try {
    const key = `${DRAFT_KEY_PREFIX}${selectionId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};
