import { useState, useEffect } from "react";
import { Button } from "@mui/material";

export default function TaskPrinter({ tasks, error }) {
  

  return (
    <div>
      {error && <p style={{ color: "red" }}>Fehler: {error}</p>}

      {tasks ? (
        <pre style={{ textAlign: "left", marginTop: 16 }}>
          {JSON.stringify(tasks, null, 2)}
        </pre>
      ) : (
        <p>Lade Tasks…</p>
      )}
    </div>
  );
}