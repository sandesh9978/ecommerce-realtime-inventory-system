// src/components/KhaltiPaymentButton.js
import React from "react";
import KhaltiCheckout from "khalti-checkout-web";

const KhaltiPaymentButton = ({ amount, productName }) => {
  const config = {
    publicKey: "test_public_key_dc74b7a36c6e47c6b4d33a446e4f69c7", // Replace with your public key
    productIdentity: productName,
    productName: productName,
    productUrl: "http://localhost:3000/",
    eventHandler: {
      onSuccess(payload) {
        console.log("✅ Payment Success", payload);
        alert("Payment Successful!\nTxn Ref: " + payload.idx);
      },
      onError(error) {
        console.log("❌ Payment Error", error);
        alert("Payment Failed");
      },
      onClose() {
        console.log("🛑 Payment closed by user");
      },
    },
    paymentPreference: [
      "KHALTI",
      "EBANKING",
      "MOBILE_BANKING",
      "CONNECT_IPS",
      "SCT",
    ],
  };

  const checkout = new KhaltiCheckout(config);

  const handlePay = () => {
    checkout.show({ amount: amount * 100 }); // Khalti expects amount in paisa
  };

  return (
    <button
      onClick={handlePay}
      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 mt-1"
    >
      Pay with Khalti
    </button>
  );
};

export default KhaltiPaymentButton;
