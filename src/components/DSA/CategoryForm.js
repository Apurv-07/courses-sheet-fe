import React, { useState, useEffect } from "react";

const CategoryForm = ({ onSubmit, initialData, loading }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialData) setName(initialData.name);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        className="border rounded px-2 py-1 flex-1"
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-1 rounded"
        disabled={loading}
      >
        {initialData ? "Update" : "Add"}
      </button>
    </form>
  );
};

export default CategoryForm;
