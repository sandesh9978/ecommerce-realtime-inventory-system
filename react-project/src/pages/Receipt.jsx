import React from "react";
import { useLocation, Link } from "react-router-dom";
import jsPDF from "jspdf";

const Receipt = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">No Receipt Found</h2>
        <Link to="/" className="text-blue-600 underline">Go Home</Link>
      </div>
    );
  }

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Order Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderId || order.order_id || "-"}`, 20, 35);
    doc.text(`Name: ${order.userInfo?.fullName || "-"}`, 20, 45);
    doc.text(`Email: ${order.userInfo?.email || "-"}`, 20, 55);
    doc.text(`Phone: ${order.userInfo?.phoneNumber || "-"}`, 20, 65);
    doc.text(`Address: ${order.userInfo?.address || "-"}`, 20, 75);
    doc.text(`City: ${order.userInfo?.city || "-"}`, 20, 85);
    doc.text(`Postal Code: ${order.userInfo?.postalCode || "-"}`, 20, 95);
    doc.text(`Payment Method: ${order.paymentMethod || "-"}`, 20, 105);
    doc.text(`Total Amount: Rs. ${order.totalAmount?.toLocaleString() || "-"}`, 20, 115);
    doc.text("Products:", 20, 125);
    let y = 135;
    (order.products || []).forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.name || item.productName || "Product"} x${item.quantity} - Rs. ${item.price?.toLocaleString()}`,
        25,
        y
      );
      y += 10;
    });
    doc.save("receipt.pdf");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" /></svg>
          Order Receipt
        </h2>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">Success</span>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-blue-100">
        <div className="mb-2 flex flex-wrap gap-4 justify-between">
          <div>
            <span className="font-semibold text-gray-600">Order ID:</span>
            <span className="ml-2 text-blue-700 font-bold">{order.orderId || order.order_id || "-"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Date:</span>
            <span className="ml-2">{new Date().toLocaleString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-bold text-lg text-blue-600 mb-2">Customer Info</h3>
            <div className="text-gray-700">
              <div><span className="font-semibold">Name:</span> {order.userInfo?.fullName}</div>
              <div><span className="font-semibold">Email:</span> {order.userInfo?.email}</div>
              <div><span className="font-semibold">Phone:</span> {order.userInfo?.phoneNumber}</div>
              <div><span className="font-semibold">Address:</span> {order.userInfo?.address}</div>
              <div><span className="font-semibold">City:</span> {order.userInfo?.city}</div>
              <div><span className="font-semibold">Postal Code:</span> {order.userInfo?.postalCode}</div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-blue-600 mb-2">Order Info</h3>
            <div className="text-gray-700">
              <div><span className="font-semibold">Payment Method:</span> {order.paymentMethod}</div>
              <div><span className="font-semibold">Total Amount:</span> <span className="text-green-700 font-bold">Rs. {order.totalAmount?.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-green-100">
        <h3 className="font-bold text-lg text-green-700 mb-4">Products</h3>
        <ul className="divide-y divide-blue-50">
          {(order.products || []).map((item, idx) => (
            <li key={idx} className="py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-700">{item.name || item.productName}</span>
              <span className="text-gray-500">x{item.quantity}</span>
              <span className="text-blue-700 font-bold">Rs. {item.price?.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow hover:from-green-600 hover:to-blue-600 transition"
        >
          Download Receipt
        </button>
        <Link to="/" className="text-blue-700 underline font-semibold">Back to Home</Link>
      </div>
    </div>
  );
};

export default Receipt; 