"use client"

import { createContext, useContext, type ReactNode, useEffect } from "react"
import { useQuestionnaire } from "@/hooks/use-questionnaire"
import { QuestionnaireModal } from "@/components/questionnaire/questionnaire-modal"
import type { QuestionnaireStep, QuestionnaireResponses } from "@/hooks/use-questionnaire"

interface QuestionnaireProviderProps {
  children: ReactNode
  steps: QuestionnaireStep[]
  storageKey?: string
  onComplete?: (responses: QuestionnaireResponses) => void
  showOnlyOnce?: boolean
}

const QuestionnaireContext = createContext<ReturnType<typeof useQuestionnaire> | null>(null)

export function QuestionnaireProvider({
  children,
  steps,
  storageKey,
  onComplete,
  showOnlyOnce = true,
}: QuestionnaireProviderProps) {
  const questionnaire = useQuestionnaire({
    steps,
    storageKey,
    onComplete,
    showOnlyOnce,
  })

  // Force reset the questionnaire for testing
  useEffect(() => {
    // Uncomment this line to force reset the questionnaire for testing
    // localStorage.removeItem("questionnaire-completed");
  }, [])

  return (
    <QuestionnaireContext.Provider value={questionnaire}>
      {children}
      <QuestionnaireModal
        isOpen={questionnaire.isOpen}
        onClose={questionnaire.skipQuestionnaire}
        currentStep={questionnaire.currentStep}
        currentStepIndex={questionnaire.currentStepIndex}
        totalSteps={questionnaire.totalSteps}
        responses={questionnaire.responses}
        updateResponse={questionnaire.updateResponse}
        nextStep={questionnaire.nextStep}
        prevStep={questionnaire.prevStep}
        skipQuestionnaire={questionnaire.skipQuestionnaire}
        progress={questionnaire.progress}
      />
    </QuestionnaireContext.Provider>
  )
}

export function useQuestionnaireContext() {
  const context = useContext(QuestionnaireContext)
  if (!context) {
    throw new Error("useQuestionnaireContext must be used within a QuestionnaireProvider")
  }
  return context
}

