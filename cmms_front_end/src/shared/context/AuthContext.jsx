import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getCurrentUserAccess } from '../services/api';
import { hasAnyEffectivePermission, hasEffectivePermission } from '../utils/permissionPolicy';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [allowedSites, setAllowedSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const applyAccess = useCallback((access = {}, jwtToken = localStorage.getItem('token')) => {
    const nextUser = access.user || null;
    const nextRoles = access.roles || [];
    const nextPermissions = access.permissions || [];
    const nextAllowedSites = access.allowedSites || [];
    setUser(nextUser);
    setToken(jwtToken);
    setRoles(nextRoles);
    setPermissions(nextPermissions);
    setAllowedSites(nextAllowedSites);
    setIsAuthenticated(Boolean(nextUser && jwtToken));
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    if (jwtToken) localStorage.setItem('token', jwtToken);
    localStorage.setItem('roles', JSON.stringify(nextRoles));
    localStorage.setItem('permissions', JSON.stringify(nextPermissions));
    localStorage.setItem('allowedSites', JSON.stringify(nextAllowedSites));
  }, []);

  const clearSession = useCallback(() => {
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
  }, []);

  const refreshAccess = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return null;
    const response = await getCurrentUserAccess();
    applyAccess(response.data || {}, savedToken);
    return response.data;
  }, [applyAccess]);

  useEffect(() => {
    let active = true;
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (!savedUser || !savedToken) {
      setLoading(false);
      return undefined;
    }

    try {
      applyAccess({
        user: JSON.parse(savedUser),
        roles: JSON.parse(localStorage.getItem('roles') || '[]'),
        permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
        allowedSites: JSON.parse(localStorage.getItem('allowedSites') || '[]'),
      }, savedToken);
    } catch {
      clearSession();
      setLoading(false);
      return undefined;
    }

    refreshAccess()
      .catch((error) => {
        if (error.response?.status === 401) clearSession();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [applyAccess, clearSession, refreshAccess]);

  useEffect(() => {
    const handleAuthExpired = () => clearSession();
    window.addEventListener('cmms:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('cmms:auth-expired', handleAuthExpired);
  }, [clearSession]);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (localStorage.getItem('token')) refreshAccess().catch(() => {});
    };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [refreshAccess]);

  const login = useCallback((userData, jwtToken, access = {}) => {
    applyAccess({ ...access, user: userData }, jwtToken);
  }, [applyAccess]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateUser = useCallback((updates = {}) => {
    setUser((current) => {
      const nextUser = { ...(current || {}), ...updates };
      const hasChanges = Object.keys(updates).some((key) => current?.[key] !== updates[key]);
      if (!hasChanges) {
        return current;
      }
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const getToken = () => {
    return token || localStorage.getItem('token');
  };

  const hasPermission = (permissionCode) => {
    return hasEffectivePermission({ roles, permissions, legacyRole: user?.role }, permissionCode);
  };

  const hasAnyPermission = (permissionCodes = []) => {
    return hasAnyEffectivePermission({ roles, permissions, legacyRole: user?.role }, permissionCodes);
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
      updateUser,
      refreshAccess,
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
