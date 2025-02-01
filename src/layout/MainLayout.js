import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";


const MainLayout = () => {
  return (
    <div className="box">
        <Sidebar />
        <div className="content">
            <Outlet />
        </div>
      <style jsx>
        {`
          .box {
            display: flex;
            min-height: 100vh;
            background-color: #f5f5f5;
          }
            .content {
          flex: 1;
          padding: 20px; /* Adjust padding as needed */
        }
        `}
        
      </style>
    </div>
  );
};

export default MainLayout;