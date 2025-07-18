// src/components/Footer.jsx

import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 px-4 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Contact Info</h4>
          <p><strong>Project:</strong> E-Commerce Storefront</p>
          <p><strong>Location:</strong> Kathmandu, Nepal</p>
          <p><strong>Email:</strong> info@estorefront.com</p>
          <p><strong>Working Hours:</strong><br />Sun – Fri / 9AM – 5PM</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Customer Service</h4>
          <ul className="space-y-1">
            <li>About Us</li>
            <li>Contact Us</li>
            <li>How to Order</li>
            <li>Payment Policy</li>
            <li>FAQs</li>
            <li>Return & Refund</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Popular Categories</h4>
          <span className="inline-block bg-slate-800 px-2 py-1 rounded text-xs">
            Smartphones
          </span>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Subscribe to Our Newsletter</h4>
          <p className="mb-2">Get updates on new products, stock alerts, and offers.</p>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-2 rounded mb-2 text-black"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Subscribe
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 mt-6">
        © 2025 E-Commerce Storefront. Payment is made only after the customer receives the product.
      </div>
    </footer>
  );
}

export default Footer;
