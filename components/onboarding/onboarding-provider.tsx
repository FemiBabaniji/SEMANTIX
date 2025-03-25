"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type OnboardingStep =
  | "welcome"
  | "metadata"
  | "metadata-try"
  | "logic"
  | "logic-try"
  | "action"
  | "action-try"
  | "feedback"
  | "complete"
  | null

interface OnboardingContextType {
  currentStep: OnboardingStep
  isOnboarding: boolean
  startOnboarding: () => void
  nextStep: () => void
  skipOnboarding: () => void
  resetOnboarding: () => void
  completeOnboarding: () => void
  completedSteps: Record<string, boolean>
  markStepComplete: (step: string) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STEPS_ORDER: OnboardingStep[] = [
  "welcome",
  "metadata",
  "metadata-try",
  "logic",
  "logic-try",
  "action",
  "action-try",
  "feedback",
  "complete",
]

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Update the useLocalStorage hook usage to track more states
  const [onboardingState, setOnboardingState] = useLocalStorage("onboarding-state", {
    completed: false,
    dismissed: false,
    lastShown: null,
  })

  // Replace the hasCompletedOnboarding state with the new onboardingState
  // const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage("onboarding-completed", false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(null)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})

  // Update the startOnboarding function to prevent recursive state updates
  const startOnboarding = () => {
    // Don't restart if already in onboarding mode
    if (isOnboarding) {
      console.log("Onboarding already in progress, ignoring start request")
      return
    }

    // Don't start if already completed or dismissed
    if (onboardingState.completed || onboardingState.dismissed) {
      console.log("Onboarding already completed or dismissed, ignoring start request")
      return
    }

    console.log("Starting onboarding...")
    // Use functional updates to avoid dependency on current state
    setIsOnboarding(true)
    setCurrentStep("welcome")
    setCompletedSteps({})
  }

  const nextStep = () => {
    if (!currentStep) return

    console.log("Moving to next step from:", currentStep)
    const currentIndex = STEPS_ORDER.indexOf(currentStep)
    if (currentIndex < STEPS_ORDER.length - 1) {
      const nextStepValue = STEPS_ORDER[currentIndex + 1]
      console.log("Next step will be:", nextStepValue)
      setCurrentStep(nextStepValue)

      // Mark the current step as completed
      setCompletedSteps((prev) => ({
        ...prev,
        [currentStep]: true,
      }))
    } else {
      console.log("Completing onboarding")
      completeOnboarding()
    }
  }

  // Update the skipOnboarding function to mark as dismissed
  const skipOnboarding = () => {
    setIsOnboarding(false)
    setCurrentStep(null)
    setOnboardingState({
      ...onboardingState,
      dismissed: true,
      lastShown: new Date().toISOString(),
    })
  }

  // Update the resetOnboarding function
  const resetOnboarding = () => {
    setOnboardingState({
      completed: false,
      dismissed: false,
      lastShown: null,
    })
    setIsOnboarding(false)
    setCurrentStep(null)
    setCompletedSteps({})
  }

  // Update the completeOnboarding function
  const completeOnboarding = () => {
    setOnboardingState({
      ...onboardingState,
      completed: true,
      lastShown: new Date().toISOString(),
    })
    setIsOnboarding(false)
    setCurrentStep(null)
    
    // Scroll to the feedback section after a short delay
    setTimeout(() => {
      const feedbackSection = document.querySelector('h2:contains("Feature Suggestions")') || 
                             document.querySelector('h2') // Fallback to first h2 if specific one not found
      if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 500)
  }

  const markStepComplete = (step: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [step]: true,
    }))
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        isOnboarding,
        startOnboarding,
        nextStep,
        skipOnboarding,
        resetOnboarding,
        completeOnboarding,
        completedSteps,
        markStepComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
