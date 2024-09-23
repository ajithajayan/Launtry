import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthAdmin from '../../utils/isAuthAdmin';
import Loader from '../loader/Loader';

function AdminPrivateRoute({ children }) {
  
  const [isAuthenticated, setIsAuthenticated] = useState({
    is_authenticated: false,
    is_admin: false,
    name: null,
  });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const authInfo = await isAuthAdmin();
      setIsAuthenticated({
        is_authenticated: authInfo.isAuthenticated,
        is_admin: authInfo.isAdmin,
        name: authInfo.name,
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    // Show loading spinner while authentication status is being checked
    return <Loader />;
  }

  if (!isAuthenticated.is_authenticated || !isAuthenticated.is_admin) {
    // If not authenticated or not an admin, redirect to login page
    return <Navigate to="/admincontrol/login" />;
  }

  // If authenticated and is an admin, render the child components
  return children;
}

export default AdminPrivateRoute;
