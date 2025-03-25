"use client"

import { useEffect, useState } from "react"
import { X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { cn } from "@/lib/utils"

interface OnboardingModalProps {
  title: string
  description: string
  step: string
  actionLabel?: string
  showSkip?: boolean
  showTryIt?: boolean
  showReset?: boolean
  onTryIt?: () => void
  className?: string
}

export function OnboardingModal({
  title,
  description,
  step,
  actionLabel = "Next",
  showSkip = true,
  showTryIt = false,
  showReset = false,
  onTryIt,
  className,
}: OnboardingModalProps) {
  const { nextStep, skipOnboarding, resetOnboarding, currentStep, completedSteps } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Add a small delay for animation purposes
    if (currentStep === step) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [currentStep, step])

  if (currentStep !== step) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-lg bg-white p-6 shadow-lg transition-all duration-300",
          isVisible ? "translate-y-0" : "translate-y-4",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button variant="ghost" size="icon" onClick={skipOnboarding} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="flex items-center justify-between">
          {showSkip && (
            <Button variant="ghost" size="sm" onClick={skipOnboarding}>
              Skip tour
            </Button>
          )}

          {showReset && (
            <Button variant="ghost" size="sm" onClick={resetOnboarding}>
              Reset tour
            </Button>
          )}

          <div className="flex gap-2">
            {showTryIt && (
              <Button variant="outline" size="sm" onClick={onTryIt}>
                Try it
              </Button>
            )}

            <Button size="sm" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4">
              {actionLabel}
              {actionLabel === "Next" && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-4 flex justify-center gap-1.5">
          {["welcome", "metadata", "logic", "action", "feedback", "complete"].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 w-8 rounded-full",
                currentStep === s ? "bg-blue-500" : completedSteps[s] ? "bg-green-500" : "bg-gray-200",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

