import React, { useContext } from "react";
import { AuthContext } from "../authContext";
import { useNavigate } from "react-router-dom";

const AdminDashboardPage = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/admin/login");
  };

  return (
    <>
      <div className="w-full flex items-center text-white h-screen bg-black px-16 py-16 flex-col">
        <div className="flex justify-between w-full">
          <h2 className="font-bold text-xl">APP</h2>
          <button
            className="bg-[#9BFF00] px-4 py-2 rounded-xl text-black"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
