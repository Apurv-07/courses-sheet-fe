import React from "react";

const CategoryList = ({ categories, onSelect, onEdit, onDelete }) => (
  <ul className="divide-y divide-gray-200">
    {categories.map((cat) => (
      <li key={cat._id} className="flex items-center justify-between py-2">
        <button
          className="text-blue-600 hover:underline text-left flex-1"
          onClick={() => onSelect(cat)}
        >
          {cat.name}
        </button>
        <div className="flex gap-2">
          <button
            className="text-yellow-500 hover:underline"
            onClick={() => onEdit(cat)}
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:underline"
            onClick={() => onDelete(cat)}
          >
            Delete
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default CategoryList;
