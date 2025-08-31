import React, { useEffect, useState } from "react";
import axios from "axios";

const DsaList = () => {
  const [dsaContent, setDsaContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDsaContent = async () => {
      try {
        const response = await axios.get("/api/dsa"); // Adjust the endpoint as necessary
        setDsaContent(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDsaContent();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">COURSEContent</h1>
      <ul className="space-y-2">
        {dsaContent.map((item) => (
          <li key={item.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DsaList;
