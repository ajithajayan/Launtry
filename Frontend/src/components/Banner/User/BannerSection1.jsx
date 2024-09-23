import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import DoctorConsultation from "../../../assets/tailor/tail1.jpg";

function BannerSection1() {
    useEffect(() => {
        window.addEventListener("scroll", () => {
          console.log("ping");
        });
      }, []);
  return (
    <div>
      <div className="App absolute">
        <div
          className="panel panel-1 flex items-center justify-center w-screen h-screen bg-pink-400 fixed top-0"
          style={{
            backgroundImage: `url(${DoctorConsultation})`,
            backgroundSize: "cover",
          }}
        >
          Section 1
        </div>
        <div
          className="panel panel-2 sticky top-0 flex items-center justify-center w-screen h-screen bg-blue-400"
          style={{
            backgroundImage: `url(${DoctorConsultation})`,
            backgroundSize: "cover",
          }}
        >
          Section 2
        </div>
        <div
          className="panel panel-3 sticky top-0 relative flex items-center justify-center w-screen h-screen bg-green-400"
          style={{
            backgroundImage: `url(${DoctorConsultation})`,
            backgroundSize: "cover",
          }}
        >
          Section 3
        </div>
        <div
          className="panel panel-4 sticky top-0 relative flex items-center justify-center w-screen h-screen bg-red-400"
          style={{
            backgroundImage: `url(${DoctorConsultation})`,
            backgroundSize: "cover",
          }}
        >
          Section 4
        </div>
      </div>
    </div>
  );
}

export default BannerSection1;
