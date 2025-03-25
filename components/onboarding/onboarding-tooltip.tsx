"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { cn } from "@/lib/utils"

interface OnboardingTooltipProps {
  step: string
  targetSelector: string
  title: string
  description: string
  position?: "top" | "right" | "bottom" | "left"
  showTryIt?: boolean
  onTryIt?: () => void
  className?: string
}

export function OnboardingTooltip({
  step,
  targetSelector,
  title,
  description,
  position = "bottom",
  showTryIt = false,
  onTryIt,
  className,
}: OnboardingTooltipProps) {
  const { nextStep, currentStep } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep === step) {
      console.log(`Looking for target element with selector: ${targetSelector}`)
      const targetElement = document.querySelector(targetSelector)

      if (targetElement) {
        console.log(`Found target element for step ${step}`)
        const rect = targetElement.getBoundingClientRect()
        console.log(`Element position: top=${rect.top}, left=${rect.left}, width=${rect.width}, height=${rect.height}`)

        // Calculate position based on the specified direction
        let top = 0
        let left = 0

        switch (position) {
          case "top":
            top = rect.top - (tooltipRef.current?.offsetHeight || 0) - 10
            left = rect.left + rect.width / 2
            break
          case "right":
            top = rect.top + rect.height / 2
            left = rect.right + 10
            break
          case "bottom":
            top = rect.bottom + 10
            left = rect.left + rect.width / 2
            break
          case "left":
            top = rect.top + rect.height / 2
            left = rect.left - (tooltipRef.current?.offsetWidth || 0) - 10
            break
        }

        setTooltipPosition({ top, left })

        // Add highlight to the target element
        targetElement.classList.add("ring-2", "ring-blue-500", "ring-offset-2")

        // Show tooltip with a small delay for animation
        setTimeout(() => {
          setIsVisible(true)
        }, 300)

        return () => {
          targetElement.classList.remove("ring-2", "ring-blue-500", "ring-offset-2")
        }
      } else {
        console.warn(`Target element not found for selector: ${targetSelector}`)
      }
    } else {
      setIsVisible(false)
    }
  }, [currentStep, step, targetSelector, position])

  if (currentStep !== step) return null

  // Calculate additional positioning classes based on the position
  const positionClasses = {
    top: "transform -translate-x-1/2 -translate-y-full",
    right: "transform translate-y-[-50%]",
    bottom: "transform -translate-x-1/2",
    left: "transform -translate-x-full translate-y-[-50%]",
  }

  // Calculate arrow classes based on the position
  const arrowClasses = {
    top: "bottom-[-6px] left-1/2 transform -translate-x-1/2 border-t-blue-100 border-l-transparent border-r-transparent border-b-transparent",
    right:
      "left-[-6px] top-1/2 transform -translate-y-1/2 border-r-blue-100 border-t-transparent border-b-transparent border-l-transparent",
    bottom:
      "top-[-6px] left-1/2 transform -translate-x-1/2 border-b-blue-100 border-l-transparent border-r-transparent border-t-transparent",
    left: "right-[-6px] top-1/2 transform -translate-y-1/2 border-l-blue-100 border-t-transparent border-b-transparent border-r-transparent",
  }

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-[99999] w-64 rounded-lg bg-blue-100 p-4 shadow-lg transition-all duration-300",
        positionClasses[position],
        isVisible ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
    >
      {/* Arrow */}
      <div className={cn("absolute h-0 w-0 border-[6px]", arrowClasses[position])} />

      <h4 className="mb-1 font-medium text-blue-900">{title}</h4>
      <p className="mb-3 text-xs text-blue-800">{description}</p>

      <div className="flex justify-end gap-2">
        {showTryIt && (
          <Button variant="outline" size="sm" className="h-7 bg-white text-xs" onClick={onTryIt}>
            Try it
          </Button>
        )}

        <Button size="sm" className="h-7 bg-blue-600 text-white font-medium hover:bg-blue-700 px-4" onClick={nextStep}>
          Next
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

