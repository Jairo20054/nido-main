// authMock.js
// Mock authentication functions for easy integration
// Replace with real auth service (e.g., Auth0, Firebase) in production

let isLoggedIn = false; // Simulate auth state

export const isAuthenticated = () => {
  return isLoggedIn;
};

export const login = (email, password) => {
  // Simulate login process
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        isLoggedIn = true;
        resolve({ id: 1, email, name: 'Usuario Mock' });
      } else {
        reject(new Error('Credenciales inválidas'));
      }
    }, 1000); // Simulate network delay
  });
};

export const logout = () => {
  isLoggedIn = false;
};

// For testing purposes, you can call login() with any email/password to simulate success
