import React from 'react';

export const Elements = () => {
  return (
    <div className="space-y-4">
      {/* Example usage of components */}
      <Label text="Username" htmlFor="username" />
      <TextField name="username" placeholder="Enter username" />
      <Button label="Submit" onClick={() => alert('Clicked!')} />
    </div>
  );
};

export function Button({ label, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={className || "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"}
    >
      {label}
    </button>
  );
}

export function TextField({ name, placeholder, type = "text", className }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={className || "border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"}
    />
  );
}

export function Label({ text, htmlFor, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={className || "block mb-1 font-medium text-gray-700"}
    >
      {text}
    </label>
  );
}
