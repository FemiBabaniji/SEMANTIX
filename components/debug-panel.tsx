"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [envVars, setEnvVars] = useState<{ [key: string]: string }>({})

  // Function to test the connection - renamed to avoid naming conflict
  const checkConnection = async () => {
    setConnectionStatus("loading")
    setErrorDetails("")

    try {
      const { data, error } = await supabase.from("documents").select("count", { count: "exact" }).limit(1)

      if (error) {
        setConnectionStatus("error")
        setErrorDetails(JSON.stringify(error, null, 2))
      } else {
        setConnectionStatus("connected")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorDetails(error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => {
    // Check for environment variables
    const vars: { [key: string]: string } = {}
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      vars["NEXT_PUBLIC_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL
    } else {
      vars["NEXT_PUBLIC_SUPABASE_URL"] = "Not set"
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      vars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "Set (hidden for security)"
    } else {
      vars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "Not set"
    }

    setEnvVars(vars)

    // Test connection
    checkConnection()
  }, []) // Empty dependency array to run only once

  if (!isOpen) {
    return (
      <Button className="fixed bottom-4 right-4 z-50" onClick={() => setIsOpen(true)} variant="outline" size="sm">
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Debug Panel</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Supabase Connection</h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              <span>
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "error"
                    ? "Error"
                    : "Checking..."}
              </span>
            </div>

            {connectionStatus === "error" && (
              <div className="mt-2 text-xs text-red-500 max-h-32 overflow-auto bg-gray-50 p-2 rounded">
                <pre>{errorDetails}</pre>
              </div>
            )}

            <Button size="sm" onClick={checkConnection} className="mt-2">
              Test Connection
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-1">Environment Variables</h3>
            <div className="text-xs bg-gray-50 p-2 rounded">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-mono">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

