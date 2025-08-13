import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './css/ApiTestPanel.css';

const ApiTestPanel = () => {
  const { token } = useSelector((state) => state.auth);
  const [testData, setTestData] = useState({
    caste: 'Test Caste',
    id: '1'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCurlCommands = () => {
    const baseUrl = 'http://localhost:8000';
    const authHeader = token ? `Bearer ${token}` : 'YOUR_TOKEN';

    return {
      get: `curl -X GET ${baseUrl}/api/castes -H "Accept: application/json" -H "Authorization: ${authHeader}"`,
      getById: `curl -X GET ${baseUrl}/api/castes/${testData.id} -H "Accept: application/json" -H "Authorization: ${authHeader}"`,
      post: `curl -X POST ${baseUrl}/api/castes \\
  -H "Accept: application/json" \\
  -H "Authorization: ${authHeader}" \\
  -d '{
    "caste": "${testData.caste}"
  }'`,
      put: `curl -X PUT ${baseUrl}/api/castes/${testData.id} \\
  -H "Accept: application/json" \\
  -H "Authorization: ${authHeader}" \\
  -d '{
    "caste": "${testData.caste}"
  }'`,
      delete: `curl -X DELETE ${baseUrl}/api/castes/${testData.id} \\
  -H "Accept: application/json" \\
  -H "Authorization: ${authHeader}"`
    };
  };

  const curlCommands = generateCurlCommands();

  return (
    <div className="api-test-panel">
      <div className="panel-header">
        <h2>API Test Panel</h2>
        <p>Test the caste API endpoints with curl commands</p>
      </div>

      <div className="test-controls">
        <div className="input-group">
          <label htmlFor="testCaste">Test Caste Name:</label>
          <input
            type="text"
            id="testCaste"
            name="caste"
            value={testData.caste}
            onChange={handleInputChange}
            placeholder="Enter test caste name"
          />
        </div>
        <div className="input-group">
          <label htmlFor="testId">Test ID:</label>
          <input
            type="text"
            id="testId"
            name="id"
            value={testData.id}
            onChange={handleInputChange}
            placeholder="Enter test ID"
          />
        </div>
      </div>

      <div className="curl-commands">
        <h3>Curl Commands</h3>
        
        <div className="command-section">
          <h4>GET - Fetch All Castes</h4>
          <div className="command-block">
            <code>{curlCommands.get}</code>
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(curlCommands.get)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="command-section">
          <h4>GET - Fetch Caste by ID</h4>
          <div className="command-block">
            <code>{curlCommands.getById}</code>
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(curlCommands.getById)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="command-section">
          <h4>POST - Create New Caste</h4>
          <div className="command-block">
            <code>{curlCommands.post}</code>
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(curlCommands.post)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="command-section">
          <h4>PUT - Update Caste</h4>
          <div className="command-block">
            <code>{curlCommands.put}</code>
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(curlCommands.put)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="command-section">
          <h4>DELETE - Delete Caste</h4>
          <div className="command-block">
            <code>{curlCommands.delete}</code>
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(curlCommands.delete)}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="api-info">
        <h3>API Response Format</h3>
        <div className="response-examples">
          <div className="response-example">
            <h4>Success Response (GET /api/castes)</h4>
            <pre>{`[
  {
    "id": 1,
    "caste": "General",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  {
    "id": 2,
    "caste": "OBC",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]`}</pre>
          </div>
          
          <div className="response-example">
            <h4>Success Response (POST/PUT)</h4>
            <pre>{`{
  "id": 1,
  "caste": "General",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPanel;
