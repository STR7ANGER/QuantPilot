"use client";

import { useEffect, useState } from "react";

export default function TestStream() {
  const [logs, setLogs] = useState<string[]>([]);
  const id = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"; // change ID to test

  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLogs((prev) => [...prev, `Fetching stream for ID: ${id}`]);
        
        const response = await fetch(`/api/live-stream/${id}`);
        
        if (!response.ok) {
          const error = await response.json();
          setLogs((prev) => [...prev, `Error: ${error.error || response.statusText}`]);
          return;
        }

        if (!response.body) {
          setLogs((prev) => [...prev, "Error: No response body"]);
          return;
        }

        setLogs((prev) => [...prev, "Stream connected, reading data..."]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            setLogs((prev) => [...prev, "Stream ended"]);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          setLogs((prev) => [...prev, `Data: ${chunk}`]);
        }
      } catch (error: any) {
        setLogs((prev) => [...prev, `Error: ${error.message}`]);
      }
    };

    fetchStream();
  }, [id]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Testing streamById(id)</h1>
      <p>Check console + logs below</p>

      <div
        style={{
          background: "#000",
          color: "#0f0",
          padding: 10,
          height: 300,
          overflow: "auto",
          borderRadius: 6,
          fontFamily: "monospace",
        }}
      >
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
