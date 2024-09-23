import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Appointment from "../../components/userside/Appointment";
import BannerSection2 from "../../components/Banner/User/BannerSection2";


function UserHome() {
  const navigate = useNavigate();
  const authentication_user = useSelector((state) => state.authentication_user);
 
  return (
    <>
      <BannerSection2/>

      <Appointment />
      {/* <FAQSection /> */}
    </>
  );
}

export default UserHome;
