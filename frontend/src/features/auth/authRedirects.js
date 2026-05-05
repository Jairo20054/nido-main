export const resolvePostAuthDestination = (state, user) => {
  if (state?.from) {
    return state.from;
  }

  if (user?.role === 'ADMIN') {
    return '/admin';
  }

  if (user?.role === 'LANDLORD') {
    return '/manage';
  }

  return '/account';
};
