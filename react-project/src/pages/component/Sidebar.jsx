import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pages = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Products", path: "/products" },
  { name: "Cart", path: "/cart" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "Orders", path: "/orders" },
  { name: "How To Order", path: "/how-to-order" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
  { name: "Return & Refund", path: "/return-refund" },
  { name: "Feedback", path: "/feedback" },
];

const getProfilePic = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.role === "admin") {
    return localStorage.getItem("adminProfilePic") || "/default-avatar.svg";
  } else {
    return localStorage.getItem("userProfilePic") || "/default-avatar.svg";
  }
};
const getProfileName = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.role === "admin") {
    return localStorage.getItem("adminName") || user.name || "Admin";
  } else {
    return localStorage.getItem("userName") || user.name || "User";
  }
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  console.log("Sidebar user:", user);
  const isAdmin = user && user.role === "admin";

  // Profile keys
  const nameKey = isAdmin ? "adminName" : "userName";
  const imageKey = isAdmin ? "adminProfilePic" : "userProfilePic";

  // State for profile name and image
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem(nameKey) || (user?.name || (isAdmin ? "Admin" : "User"));
  });
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem(imageKey) || "/default-avatar.svg";
  });
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const fileInputRef = useRef();

  // Handle name edit
  const handleNameEdit = () => {
    setEditingName(true);
    setTempName(profileName);
  };
  const handleNameSave = () => {
    setProfileName(tempName);
    localStorage.setItem(nameKey, tempName);
    setEditingName(false);
  };
  const handleNameCancel = () => {
    setEditingName(false);
    setTempName(profileName);
  };

  // Handle image upload
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(imageKey, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded shadow hover:bg-gray-700 focus:outline-none md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open sidebar menu"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-8 h-8">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <polygon points="14,16 20,12 14,8" fill="white" />
        </svg>
      </button>
      {/* Sidebar: always visible on md+ screens, overlay on mobile */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-40
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
        style={{ minHeight: "100vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setOpen(false)} aria-label="Close sidebar" className="md:hidden">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center py-6">
          <div className="relative mb-2">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer"
              onClick={handleImageClick}
              title="Click to change profile picture"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <span className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1 cursor-pointer" onClick={handleImageClick} title="Change profile picture">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M4 7V4a2 2 0 0 1 2-2h3" />
                <path d="M20 7V4a2 2 0 0 0-2-2h-3" />
                <path d="M4 17v3a2 2 0 0 0 2 2h3" />
                <path d="M20 17v3a2 2 0 0 1-2 2h-3" />
              </svg>
            </span>
          </div>
          <div className="w-full flex flex-col items-center">
            {editingName ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="border rounded px-2 py-1 text-center text-black w-full"
                  autoFocus
                />
                <div className="flex gap-2 justify-center">
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    onClick={handleNameSave}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-400"
                    onClick={handleNameCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden truncate w-full text-center block max-w-[180px] mx-auto flex items-center justify-center gap-2">
                {profileName}
                <button className="text-blue-400 text-xs ml-2 underline hover:text-blue-700" onClick={handleNameEdit}>Edit</button>
              </div>
            )}
          </div>
        </div>
        <nav className="flex flex-col gap-2 mt-4 px-4">
          {pages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className={`block px-4 py-2 rounded hover:bg-blue-600 transition font-medium ${location.pathname === page.path ? "bg-blue-700" : ""}`}
              onClick={() => setOpen(false)}
            >
              {page.name}
            </Link>
          ))}
          {/* Admin Manager link only for admin */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`block px-4 py-2 rounded hover:bg-purple-600 transition font-medium ${location.pathname === "/admin" ? "bg-purple-700" : ""}`}
                onClick={() => setOpen(false)}
              >
                Admin Manager
              </Link>
              <Link
                to="/admin/products-manager"
                className={`block px-4 py-2 rounded hover:bg-purple-600 transition font-medium ${location.pathname === "/admin/products-manager" ? "bg-purple-700" : ""}`}
                onClick={() => setOpen(false)}
              >
                Admin Product Manager
              </Link>
            </>
          )}
        </nav>
      </aside>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar; 