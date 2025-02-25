import React, { useState } from "react";
import axios from "axios";

function App() {
  const [address, setAddress] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setError(null);
    setPrediction(null);
    
    if (!address.trim()) {
      setError("Please enter a valid address.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", { address });
      setPrediction(response.data.predicted_price);
    } catch (err) {
      setError("Error fetching prediction. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>NYC Real Estate Price Predictor</h1>
      <input
        type="text"
        placeholder="Enter property address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ width: "60%", padding: "10px", fontSize: "16px" }}
      />
      <button onClick={handlePredict} style={{ marginLeft: "10px", padding: "10px 20px", fontSize: "16px" }}>
        Predict Price
      </button>

      {prediction && (
        <h2 style={{ marginTop: "20px", color: "green" }}>Estimated Sale Price: {prediction}</h2>
      )}
      {error && (
        <h3 style={{ marginTop: "20px", color: "red" }}>{error}</h3>
      )}
    </div>
  );
}

export default App;