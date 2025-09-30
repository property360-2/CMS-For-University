import React, { useEffect, useState } from "react";
import axios from "axios";
import JSONElementRenderer from "../renderer/JSONElementRenderer";

export default function ElementTesting() {
  const [elementData, setElementData] = useState(null);

  const elementId = "552ae6af-c0fe-4aa5-8eca-691411ff1f06";
  const baseUrl = "http://localhost:8000/api/elements";

  useEffect(() => {
    const fetchElement = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${baseUrl}/${elementId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElementData([res.data]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchElement();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Element Testing</h1>
      {elementData && <JSONElementRenderer data={elementData} />}
    </div>
  );
}
