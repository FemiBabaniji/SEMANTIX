"use client"

import { useState } from "react"
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { QuestionnaireStep, QuestionnaireField, QuestionnaireResponses } from "@/hooks/use-questionnaire"

interface QuestionnaireModalProps {
  isOpen: boolean
  onClose: () => void
  currentStep: QuestionnaireStep
  currentStepIndex: number
  totalSteps: number
  responses: QuestionnaireResponses
  updateResponse: (fieldId: string, value: any) => void
  nextStep: () => void
  prevStep: () => void
  skipQuestionnaire: () => void
  progress: number
}

export function QuestionnaireModal({
  isOpen,
  onClose,
  currentStep,
  currentStepIndex,
  totalSteps,
  responses,
  updateResponse,
  nextStep,
  prevStep,
  skipQuestionnaire,
  progress,
}: QuestionnaireModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateField = (field: QuestionnaireField) => {
    if (field.required && (!responses[field.id] || responses[field.id] === "")) {
      setErrors((prev) => ({
        ...prev,
        [field.id]: "This field is required",
      }))
      return false
    }

    if (field.type === "email" && responses[field.id]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(responses[field.id])) {
        setErrors((prev) => ({
          ...prev,
          [field.id]: "Please enter a valid email address",
        }))
        return false
      }
    }

    // Clear error if validation passes
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field.id]
      return newErrors
    })

    return true
  }

  const handleNextStep = () => {
    // Validate all fields in the current step
    const allFieldsValid = currentStep.fields.every(validateField)

    if (allFieldsValid) {
      nextStep()
    }
  }

  // Update the renderField function to make form elements more responsive
  const renderField = (field: QuestionnaireField) => {
    const hasError = !!errors[field.id]

    switch (field.type) {
      case "text":
      case "email":
        return (
          <div className="mb-4">
            <Label htmlFor={field.id} className="block mb-1 text-sm font-medium text-[#202124]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={responses[field.id] || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              onBlur={() => validateField(field)}
              className={cn(
                "w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                hasError && "border-red-500 focus:ring-red-500",
              )}
            />
            {field.helperText && !hasError && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
            {hasError && <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="mb-4">
            <Label htmlFor={field.id} className="block mb-1 text-sm font-medium text-[#202124]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={responses[field.id] || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              onBlur={() => validateField(field)}
              className={cn(
                "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                hasError && "border-red-500 focus:ring-red-500",
              )}
              rows={3}
            />
            {field.helperText && !hasError && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
            {hasError && <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "select":
        return (
          <div className="mb-4">
            <Label htmlFor={field.id} className="block mb-1 text-sm font-medium text-[#202124]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <select
              id={field.id}
              value={responses[field.id] || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              onBlur={() => validateField(field)}
              className={cn(
                "w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white",
                hasError && "border-red-500 focus:ring-red-500",
              )}
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helperText && !hasError && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
            {hasError && <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "radio":
        return (
          <div className="mb-4">
            <div className="mb-1 text-sm font-medium text-[#202124]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </div>
            <RadioGroup
              value={responses[field.id] || ""}
              onValueChange={(value) => updateResponse(field.id, value)}
              className="mt-2 space-y-2"
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-start">
                  <RadioGroupItem
                    id={`${field.id}-${option.value}`}
                    value={option.value}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {field.helperText && !hasError && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
            {hasError && <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "checkbox":
        if (field.options) {
          return (
            <div className="mb-4">
              <div className="mb-1 text-sm font-medium text-[#202124]">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </div>
              {field.helperText && !hasError && <p className="mt-1 mb-2 text-xs text-gray-500">{field.helperText}</p>}
              <div className="space-y-2">
                {field.options.map((option) => {
                  // Initialize the responses for this field as an array if it doesn't exist
                  const fieldResponses = responses[field.id] || []
                  const isChecked = Array.isArray(fieldResponses)
                    ? fieldResponses.includes(option.value)
                    : fieldResponses === option.value

                  return (
                    <div key={option.value} className="flex items-start">
                      <Checkbox
                        id={`${field.id}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Add to array if checked
                            const currentValues = Array.isArray(responses[field.id]) ? [...responses[field.id]] : []
                            updateResponse(field.id, [...currentValues, option.value])
                          } else {
                            // Remove from array if unchecked
                            const currentValues = Array.isArray(responses[field.id])
                              ? responses[field.id].filter((val: string) => val !== option.value)
                              : []
                            updateResponse(field.id, currentValues)
                          }
                        }}
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 focus:ring-blue-500 rounded mt-0.5"
                      />
                      <Label htmlFor={`${field.id}-${option.value}`} className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
              {hasError && <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>}
            </div>
          )
        } else {
          return (
            <div className="mb-4">
              <div className="flex items-start">
                <Checkbox
                  id={field.id}
                  checked={responses[field.id] || false}
                  onCheckedChange={(checked) => updateResponse(field.id, checked)}
                  className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 focus:ring-blue-500 rounded mt-0.5"
                />
                <Label htmlFor={field.id} className="ml-2 text-sm text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>
              {field.helperText && !hasError && <p className="mt-1 text-xs text-gray-500 ml-6">{field.helperText}</p>}
              {hasError && <p className="mt-1 text-xs text-red-500 ml-6">{errors[field.id]}</p>}
            </div>
          )
        }

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto my-auto overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3 flex items-center justify-center bg-blue-100 rounded-full">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base sm:text-lg font-normal text-[#202124] truncate">{currentStep.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="px-4 sm:px-6 pt-3 shrink-0">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-1 bg-gray-200" />
        </div>

        {/* Content - make it scrollable */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-grow">
          {currentStep.description && <p className="text-sm text-gray-600 mb-4">{currentStep.description}</p>}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
            className="space-y-4"
          >
            {currentStep.fields.map((field) => (
              <div key={field.id}>{renderField(field)}</div>
            ))}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
          <div>
            {currentStepIndex === 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={skipQuestionnaire}
                className="text-gray-500 hover:text-gray-700 text-sm font-normal"
              >
                Skip
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="text-gray-500 hover:text-gray-700 text-sm font-normal"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleNextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white font-normal px-4 py-2 h-9"
          >
            {currentStepIndex === totalSteps - 1 ? "Submit" : "Next"}
            {currentStepIndex !== totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

