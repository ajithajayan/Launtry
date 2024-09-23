import React, { useState, useEffect, useRef } from "react";
import BIRDS from "vanta/dist/vanta.birds.min";
import * as THREE from "three";
import "../../assets/Styles/auth.scss";
import { Route, Routes } from "react-router-dom";
import Register from "../userSide/UserRegiser";
import UserLogin from "../userSide/UserLogin";
import ResetPasswordPage from "../userSide/ResetPassword";
import PrivateRoute from "../../components/Private/PrivateRoute";


const Authenticator = () => {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        BIRDS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          wingSpan: 25.00
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);
  return (
    <div className="auth" ref={vantaRef}>
      <p style={{ color: "#fff", paddingTop: "20px" }}>
        <Routes>

          

          <Route path="/login" element={<PrivateRoute><UserLogin /></PrivateRoute>} />
          
        </Routes>
      </p>
    </div>
  );
};

export default Authenticator;
