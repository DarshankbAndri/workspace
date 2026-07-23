import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [allowedSites, setAllowedSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedRoles = localStorage.getItem('roles');
    const savedPermissions = localStorage.getItem('permissions');
    const savedAllowedSites = localStorage.getItem('allowedSites');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setRoles(savedRoles ? JSON.parse(savedRoles) : []);
      setPermissions(savedPermissions ? JSON.parse(savedPermissions) : []);
      setAllowedSites(savedAllowedSites ? JSON.parse(savedAllowedSites) : []);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setRoles([]);
      setPermissions([]);
      setAllowedSites([]);
      setIsAuthenticated(false);
    };
    window.addEventListener('cmms:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('cmms:auth-expired', handleAuthExpired);
  }, []);

  const login = (userData, jwtToken, access = {}) => {
    const nextRoles = access.roles || [];
    const nextPermissions = access.permissions || [];
    const nextAllowedSites = access.allowedSites || [];
    setUser(userData);
    setToken(jwtToken);
    setRoles(nextRoles);
    setPermissions(nextPermissions);
    setAllowedSites(nextAllowedSites);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('roles', JSON.stringify(nextRoles));
    localStorage.setItem('permissions', JSON.stringify(nextPermissions));
    localStorage.setItem('allowedSites', JSON.stringify(nextAllowedSites));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRoles([]);
    setPermissions([]);
    setAllowedSites([]);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');
    localStorage.removeItem('allowedSites');
  };

  const getToken = () => {
    return token || localStorage.getItem('token');
  };

  const hasPermission = (permissionCode) => {
    if (!permissionCode) return true;
    if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || user?.role === 'ADMIN') return true;
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes = []) => {
    if (!permissionCodes.length) return true;
    return permissionCodes.some(hasPermission);
  };

  const getAllowedSites = () => allowedSites;
  const isAdmin = () => roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || user?.role === 'ADMIN';
  const isSuperAdmin = () => roles.includes('SUPER_ADMIN');

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token,
      roles,
      permissions,
      allowedSites,
      login,
      logout,
      loading,
      getToken,
      hasPermission,
      hasAnyPermission,
      getAllowedSites,
      isAdmin,
      isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
