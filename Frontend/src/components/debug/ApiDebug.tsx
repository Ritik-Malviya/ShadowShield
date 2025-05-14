import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fileAPI } from '../../services/api';

const ApiDebug = () => {
  const { accessId } = useParams();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for:", accessId);
        const result = await fileAPI.getFileInfo(accessId);
        console.log("API Response:", result);
        setResponse(result.data);
      } catch (err) {
        console.error("API Error:", err);
        setError(err);
      }
    };

    if (accessId) {
      fetchData();
    }
  }, [accessId]);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl mb-6 font-bold text-yellow-500">API Debug for: {accessId}</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 rounded border border-red-800">
          <h3 className="font-bold text-yellow-400 mb-2">Error:</h3>
          <pre className="text-xs mt-2 overflow-auto text-white">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {response && (
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <h3 className="font-bold mb-2 text-yellow-400">Response:</h3>
          <pre className="text-xs overflow-auto text-white">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6">
        <p className="text-sm text-white">
          Check the browser console for more detailed logs.
        </p>
      </div>
    </div>
  );
};

export default ApiDebug;