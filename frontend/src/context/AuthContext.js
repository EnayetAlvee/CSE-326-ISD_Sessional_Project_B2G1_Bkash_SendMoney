import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempPhoneNumber, setTempPhoneNumber] = useState('');

  // Check if user is logged in on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('bkash_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('bkash_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setTempPhoneNumber('');
    localStorage.removeItem('bkash_user');
  };

  const setTempPhone = (phone) => {
    setTempPhoneNumber(phone);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    tempPhoneNumber,
    setTempPhone
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
