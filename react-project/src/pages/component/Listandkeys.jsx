import React, { useState } from 'react';

const ListandKeys = () => {
  const [list, setList] = useState([
    { id: 1, name: "product1", price: 120 },
    { id: 2, name: "product2", price: 130 }
  ]);

  return (
    <div className="p-4">
      <ul>
        {list.map((item) => (
          // Using item.id as key is good since it is unique and stable
          <li key={item.id} className="mb-2 border-b pb-2">
            <div><strong>ID:</strong> {item.id}</div>
            <div><strong>Name:</strong> {item.name}</div>
            <div><strong>Price:</strong> ${item.price}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListandKeys;
