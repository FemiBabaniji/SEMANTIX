"use client"

import { useEffect } from "react"
import { useOnboarding } from "./onboarding-provider"

export function ForceOnboarding() {
  const { isOnboarding } = useOnboarding()

  useEffect(() => {
    // Just log the current state, don't auto-start
    console.log("ForceOnboarding component mounted, isOnboarding:", isOnboarding)
  }, [isOnboarding])

  return null // This component doesn't render anything
}

