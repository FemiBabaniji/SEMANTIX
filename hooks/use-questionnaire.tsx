"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type QuestionnaireStep = {
  id: string
  title: string
  description?: string
  fields: QuestionnaireField[]
}

export type QuestionnaireField = {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "email"
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  helperText?: string
}

export type QuestionnaireResponses = Record<string, any>

interface UseQuestionnaireOptions {
  steps: QuestionnaireStep[]
  storageKey?: string
  onComplete?: (responses: QuestionnaireResponses) => void
  showOnlyOnce?: boolean
}

export function useQuestionnaire({
  steps,
  storageKey = "questionnaire-responses",
  onComplete,
  showOnlyOnce = true,
}: UseQuestionnaireOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [responses, setResponses] = useLocalStorage<QuestionnaireResponses>(storageKey, {})
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useLocalStorage("questionnaire-completed", false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize the questionnaire
  useEffect(() => {
    if (isInitialized) return

    // Always show the questionnaire on load unless it's been completed before (when showOnlyOnce is true)
    if (showOnlyOnce && hasCompletedQuestionnaire) {
      setIsOpen(false)
    } else {
      // Show immediately without delay
      setIsOpen(true)
    }

    setIsInitialized(true)
  }, [hasCompletedQuestionnaire, showOnlyOnce, isInitialized])

  // Add a window resize handler to adjust the modal position
  useEffect(() => {
    const handleResize = () => {
      // This will trigger a re-render when the window is resized
      // The modal will adjust its position accordingly
      if (isOpen) {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty("--vh", `${vh}px`)
      }
    }

    window.addEventListener("resize", handleResize)

    // Call once to set initial value
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isOpen])

  const currentStep = steps[currentStepIndex]

  const updateResponse = (fieldId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const nextStep = () => {
    // Validate current step
    const requiredFields = currentStep.fields.filter((field) => field.required)
    const allRequiredFieldsFilled = requiredFields.every((field) => {
      const response = responses[field.id]
      return response !== undefined && response !== ""
    })

    if (!allRequiredFieldsFilled) {
      // Handle validation error
      alert("Please fill in all required fields")
      return
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      completeQuestionnaire()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const completeQuestionnaire = () => {
    setHasCompletedQuestionnaire(true)
    setIsOpen(false)

    if (onComplete) {
      onComplete(responses)
    }
  }

  const skipQuestionnaire = () => {
    setHasCompletedQuestionnaire(true)
    setIsOpen(false)
  }

  const resetQuestionnaire = () => {
    setHasCompletedQuestionnaire(false)
    setResponses({})
    setCurrentStepIndex(0)
    setIsOpen(true)
  }

  return {
    isOpen,
    setIsOpen,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    responses,
    updateResponse,
    nextStep,
    prevStep,
    skipQuestionnaire,
    resetQuestionnaire,
    progress: ((currentStepIndex + 1) / steps.length) * 100,
  }
}

