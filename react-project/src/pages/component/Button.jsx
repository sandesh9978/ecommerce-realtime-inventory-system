import React from 'react';

function Button({ label, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded 
        transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {label}
    </button>
  );
}

export default Button;
