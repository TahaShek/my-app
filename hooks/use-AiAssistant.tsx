import { useState } from "react"

export function useAiAssistant() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("")

  const askAI = async (prompt: string) => {
    setLoading(true)
    setResponse("")

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    })

    const data = await res.json()
    setResponse(data.result)
    setLoading(false)
  }

  return { askAI, response, loading }
}