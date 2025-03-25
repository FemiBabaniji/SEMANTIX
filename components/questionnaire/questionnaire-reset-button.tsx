"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useQuestionnaireContext } from "@/components/questionnaire/questionnaire-provider"

interface QuestionnaireResetButtonProps {
  className?: string
  children?: React.ReactNode
}

export function QuestionnaireResetButton({ className, children }: QuestionnaireResetButtonProps) {
  const { resetQuestionnaire } = useQuestionnaireContext()

  return (
    <Button onClick={resetQuestionnaire} className={className}>
      {children || "Reset Questionnaire"}
    </Button>
  )
}

