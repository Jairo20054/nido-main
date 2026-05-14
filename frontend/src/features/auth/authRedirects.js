export const resolvePostAuthDestination = (state, user) => {
  if (state?.from) {
    return state.from;
  }

  return '/dashboard';
};
