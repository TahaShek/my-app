"use client"

import { useState } from "react"

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const askAI = async () => {
    setLoading(true)
    setResponse("")

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    })

    const data = await res.json()
    console.log(data)
    setResponse(data.result)
    setLoading(false)
  }

  return (
    <div className="p-4 border rounded max-w-md">
      <h2 className="font-bold mb-2">🤖 AI Assistant</h2>

      <textarea
        className="w-full border p-2"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something..."
      />

      <button
        onClick={askAI}
        className="mt-2 px-4 py-2 bg-black text-white"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {response && (
        <div className="mt-3 p-2 bg-gray-100 rounded">
          {response}
        </div>
      )}
    </div>
  )
}