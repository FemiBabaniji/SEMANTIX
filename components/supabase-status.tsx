"use client"

import { useState, useEffect } from "react"
import { testConnection } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"

export function SupabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string>("")

  const checkConnection = async () => {
    setStatus("loading")
    setErrorDetails("")

    try {
      const result = await testConnection()

      if (result.success) {
        setStatus("connected")
      } else {
        setStatus("error")
        setErrorDetails(JSON.stringify(result.error, null, 2))
      }
    } catch (error) {
      setStatus("error")
      setErrorDetails(error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border rounded-md shadow-md z-50">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === "connected" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-yellow-500"
          }`}
        />
        <span>Supabase: {status}</span>
      </div>

      {status === "error" && (
        <div className="mb-2 text-xs text-red-500 max-w-xs max-h-32 overflow-auto">
          <pre>{errorDetails}</pre>
        </div>
      )}

      <Button size="sm" onClick={checkConnection}>
        Test Connection
      </Button>
    </div>
  )
}

