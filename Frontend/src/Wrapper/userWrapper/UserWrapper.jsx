import React, { useEffect } from "react";
import UserHeader from '../../components/userside/UserHeader'
import Userfooter from '../../components/userside/Userfooter'
import UserHome from '../../pages/userSide/UserHome'

import { Outlet, useRoutes } from 'react-router-dom'
import PrivateRoute from "../../components/Private/PrivateRoute";
import isAuthUser from '../../utils/IsAuthUser'
import { useDispatch,useSelector } from 'react-redux';
import { set_Authentication } from '../../Redux/authentication/authenticationSlice'
import { set_user_basic_details } from '../../Redux/userBasicDetails/userBasicDetailsSlice'
import axios from 'axios'
import Authenticator from "../../pages/Authentication/Authenticator";
import Page404 from "../../components/404/Page404";
// import OrderCreation from "../../pages/userSide/OrderCreation";
import OrderList from "../../components/Forms/OrderList";




function UserWrapper() {

  const dispatch = useDispatch();

  const authentication_user = useSelector(state => state.authentication_user)
  

  const checkAuth = async () => {
    const isAuthenticated = await isAuthUser();
    dispatch(
      set_Authentication({
        name: isAuthenticated.name,
        isAuthenticated: isAuthenticated.isAuthenticated,
        user_id:isAuthenticated.user_id,
      })
    );
  };

  const token = localStorage.getItem('access');




  useEffect(() => {
    if(!authentication_user.user_id)
    {
     
      checkAuth();
    
    }

  }, [authentication_user])
  
  const routes = useRoutes([{
    element: (
      <>
     <UserHeader/>
      <Outlet/>
      <Userfooter/>
      </>
    ),
    children:[
      {path: "/auth/*", element:<Authenticator/>},
      {path: "/", element: <UserHome/>},
   
      
      

    ],
  },
  
  {
    element: <Page404/>, path:'*'
  }
])




return routes

}

export default UserWrapper;