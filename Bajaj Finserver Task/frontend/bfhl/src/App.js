import React, { useState } from "react";
import JsonProcessor from "./components/JsonProcessor";
import "./style.css";

function App() {
  
  document.title = "21BCE2886";

  return (
    <div className="App">
      <h1>JSON Processor</h1>
      <JsonProcessor />
    </div>
  );
}

export default App;
