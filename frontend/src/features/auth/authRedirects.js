export const normalizeAuthRedirectPath = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!normalized.startsWith('/') || normalized.startsWith('//')) {
    return null;
  }

  return normalized;
};

export const resolvePostAuthDestination = (state, user) => {
  const requestedPath = normalizeAuthRedirectPath(state?.from);

  if (requestedPath) {
    return requestedPath;
  }

  return '/dashboard';
};
