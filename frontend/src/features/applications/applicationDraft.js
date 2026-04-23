const DRAFT_PREFIX = 'nido_application_draft_';

const getDraftKey = (propertyId) => `${DRAFT_PREFIX}${propertyId}`;

export const getApplicationDraft = (propertyId) => {
  if (!propertyId) {
    return null;
  }

  try {
    const raw = localStorage.getItem(getDraftKey(propertyId));
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const saveApplicationDraft = (propertyId, nextDraft) => {
  if (!propertyId || !nextDraft) {
    return null;
  }

  const payload = {
    ...nextDraft,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(getDraftKey(propertyId), JSON.stringify(payload));
  return payload;
};

export const mergeApplicationDraft = (propertyId, patch) => {
  const current = getApplicationDraft(propertyId) || {};
  return saveApplicationDraft(propertyId, {
    ...current,
    ...patch,
  });
};

export const clearApplicationDraft = (propertyId) => {
  if (!propertyId) {
    return;
  }

  localStorage.removeItem(getDraftKey(propertyId));
};
