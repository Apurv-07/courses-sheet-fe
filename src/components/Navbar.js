import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { LoginContext } from "../loginContext/LoginContextFile";

const Navbar = () => {
  const history = useHistory();
  const { user, setUser } = useContext(LoginContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    history.push("/login");
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div
        style={{ maxWidth: "1000px" }}
        className="mx-auto flex justify-between items-center"
      >
        <Link to="/" className="text-white text-lg font-bold">
          COURSESheet
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">
            Home
          </Link>
          <Link to="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link to="/explore" className="text-gray-300 hover:text-white">
            Explore
          </Link>
          {/* Admin link removed: admin dashboard is now part of main dashboard */}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
