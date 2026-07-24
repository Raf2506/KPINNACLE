"use client";

import { useState } from "react";

/**
 * Temporary utility page: drop a file here to get its base64 data URL as
 * plain text, for pulling a locally-generated file back into the repo when
 * there's no shared filesystem with the tool that generated it. Delete this
 * route once it's no longer needed.
 */
export default function GifReceiverPage() {
  const [text, setText] = useState("");
  const [info, setInfo] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    setInfo(`${file.name} — ${file.size} bytes — ${file.type}`);
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>GIF receiver (temporary)</h1>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        style={{
          border: `2px dashed ${dragOver ? "lime" : "gray"}`,
          padding: 40,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Drop file here
      </div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <p>{info}</p>
      <textarea
        readOnly
        value={text}
        rows={20}
        style={{ width: "100%", wordBreak: "break-all" }}
      />
    </div>
  );
}
