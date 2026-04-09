import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const company = {
    name: 'Acme Industrial Corp.',
    customerGroup: 'Wholesale - Tier 1',
    rep: 'Sarah Johnson',
    email: 'purchasing@acmeindustrial.com',
  };

  const login = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      company,
      login,
      logout,
      showLoginModal,
      setShowLoginModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
