import React, { useState } from "react";

export default function PageSummarizer() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!url) return alert("Enter a URL or text!");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      alert("Error summarizing the page.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Webpage Summarizer</h1>
      <input
        type="text"
        placeholder="Enter webpage URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleSummarize}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>
      {summary && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
