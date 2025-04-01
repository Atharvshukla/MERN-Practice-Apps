import React, { useState } from "react";
import axios from "axios";

function JsonProcessor() {
  const [jsonInput, setJsonInput] = useState(""); // Text input
  const [response, setResponse] = useState(null); // API response
  const [selectedFilter, setSelectedFilter] = useState([]); // Dropdown filter
  const [error, setError] = useState(""); // JSON validation error
  const [loading, setLoading] = useState(false); // Loading state

  const dropdownOptions = ["Alphabets", "Numbers", "Highest lowercase alphabet"];

  const hardcodedFields = {
    name: "John Doe",
    dob: "17091999",
    email: "john@xyz.com",
    roll_number: "ABCD123",
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(""); // Reset error
    setResponse(null); // Reset response
    setLoading(true); // Set loading

    try {
      // Validate JSON input
      const parsedInput = JSON.parse(jsonInput);
      if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
        throw new Error("Invalid JSON: 'data' key is required and must be an array.");
      }

      // Merge hardcoded fields with user input
      const requestBody = {
        ...hardcodedFields,
        data: parsedInput.data,
      };

      // Send data to backend API
      const apiResponse = await axios.post("http://localhost:5000/bfhl", requestBody);
      setResponse(apiResponse.data);
    } catch (e) {
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter and render the response
  const renderFilteredResponse = () => {
    if (!response) return null;

    let filteredOutput = {};
    if (selectedFilter.includes("Alphabets")) filteredOutput.Alphabets = response.alphabets;
    if (selectedFilter.includes("Numbers")) filteredOutput.Numbers = response.numbers;
    if (selectedFilter.includes("Highest lowercase alphabet")) {
      filteredOutput["Highest Lowercase Alphabet"] = response.highest_lowercase_alphabet;
    }

    return (
      <div>
        <h3>Filtered Response:</h3>
        <pre>{JSON.stringify(filteredOutput, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="json-processor" style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h2>JSON Processor</h2>

      {/* JSON Input */}
      <label>
        <strong>Enter JSON (Only "data" key required):</strong>
      </label>
      <textarea
        rows="5"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        placeholder='Example: { "data": ["A","B","C","1","2"] }'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : "Submit"}
      </button>

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          <strong>{error}</strong>
        </p>
      )}

      {/* Response Section */}
      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Full Response:</h3>
          <pre style={{ background: "#F8F9FA", padding: "10px" }}>
            {JSON.stringify(response, null, 2)}
          </pre>

          {/* Dropdown Filter */}
          <label style={{ marginTop: "10px", display: "block" }}>
            <strong>Filter Response:</strong>
          </label>
          <select
            multiple
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            value={selectedFilter}
            onChange={(e) =>
              setSelectedFilter(Array.from(e.target.selectedOptions, (option) => option.value))
            }
          >
            {dropdownOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Filtered Output */}
          {renderFilteredResponse()}
        </div>
      )}
    </div>
  );
}

export default JsonProcessor;
