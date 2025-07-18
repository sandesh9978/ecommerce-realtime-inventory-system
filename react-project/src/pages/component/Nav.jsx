import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand / Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-green-600 hover:text-green-700">
              MyStore
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <Link to="/" className="hover:text-green-600 transition">Home</Link>
            <Link to="/about" className="hover:text-green-600 transition">About</Link>
            <Link to="/contact" className="hover:text-green-600 transition">Contact</Link>
            <Link to="/faq" className="hover:text-green-600 transition">FAQ</Link>
            <Link to="/how-to-order" className="hover:text-green-600 transition">How To Order</Link>
            <Link to="/products" className="hover:text-green-600 transition">Products</Link>
            <Link to="/cart" className="hover:text-green-600 transition">Cart</Link>
            <Link to="/checkout" className="hover:text-green-600 transition">Checkout</Link>
            <Link to="/order-history" className="hover:text-green-600 transition">Order History</Link>
            <Link to="/payment-policy" className="hover:text-green-600 transition">Payment Policy</Link>
            <Link to="/return-refund" className="hover:text-green-600 transition">Return & Refund</Link>
            <Link to="/wishlist" className="hover:text-green-600 transition">Wishlist</Link>
            <Link to="/register" className="hover:text-green-600 transition">Register</Link>
            <Link to="/login" className="hover:text-green-600 transition">Login</Link>
            <Link to="/dashboard" className="hover:text-green-600 transition">User Dashboard</Link>
            <Link to="/admin" className="hover:text-green-600 transition">Admin Dashboard</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 rounded"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <nav className="flex flex-col p-4 space-y-2 text-gray-700 font-medium">
            <Link to="/" onClick={toggleMenu} className="hover:text-green-600 transition">Home</Link>
            <Link to="/about" onClick={toggleMenu} className="hover:text-green-600 transition">About</Link>
            <Link to="/contact" onClick={toggleMenu} className="hover:text-green-600 transition">Contact</Link>
            <Link to="/faq" onClick={toggleMenu} className="hover:text-green-600 transition">FAQ</Link>
            <Link to="/how-to-order" onClick={toggleMenu} className="hover:text-green-600 transition">How To Order</Link>
            <Link to="/products" onClick={toggleMenu} className="hover:text-green-600 transition">Products</Link>
            <Link to="/cart" onClick={toggleMenu} className="hover:text-green-600 transition">Cart</Link>
            <Link to="/checkout" onClick={toggleMenu} className="hover:text-green-600 transition">Checkout</Link>
            <Link to="/order-history" onClick={toggleMenu} className="hover:text-green-600 transition">Order History</Link>
            <Link to="/payment-policy" onClick={toggleMenu} className="hover:text-green-600 transition">Payment Policy</Link>
            <Link to="/return-refund" onClick={toggleMenu} className="hover:text-green-600 transition">Return & Refund</Link>
            <Link to="/wishlist" onClick={toggleMenu} className="hover:text-green-600 transition">Wishlist</Link>
            <Link to="/register" onClick={toggleMenu} className="hover:text-green-600 transition">Register</Link>
            <Link to="/login" onClick={toggleMenu} className="hover:text-green-600 transition">Login</Link>
            <Link to="/dashboard" onClick={toggleMenu} className="hover:text-green-600 transition">User Dashboard</Link>
            <Link to="/admin" onClick={toggleMenu} className="hover:text-green-600 transition">Admin Dashboard</Link>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Nav;

// import React from "react";
// import { Link } from "react-router-dom";

// function Nav() {
//   return (
//     <nav className="bg-gray-100 p-4">
//       <Link className="mr-4" to="/dashboard">Dashboard</Link>
//       <Link className="mr-4" to="/orders">Orders</Link>
//       <Link className="mr-4" to="/admin">Admin</Link>
//     </nav>
//   );
// }

// export default Nav;

