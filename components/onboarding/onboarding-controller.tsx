"use client"

import { useEffect } from "react"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { OnboardingTooltip } from "@/components/onboarding/onboarding-tooltip"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface OnboardingControllerProps {
  setActiveLayer: (layer: "metadata" | "logic" | "action") => void
}

export function OnboardingController({ setActiveLayer }: OnboardingControllerProps) {
  const { currentStep, nextStep, markStepComplete } = useOnboarding()
  const { toast } = useToast()

  // Handle layer changes based on onboarding step
  useEffect(() => {
    if (!currentStep) return // Don't do anything if there's no current step

    if (currentStep === "metadata" || currentStep === "metadata-try") {
      setActiveLayer("metadata")
    } else if (currentStep === "logic" || currentStep === "logic-try") {
      setActiveLayer("logic")
    } else if (currentStep === "action" || currentStep === "action-try") {
      setActiveLayer("action")
    }
  }, [currentStep, setActiveLayer])

  // Simulated try-it functions
  const handleTryMetadata = () => {
    toast({
      title: "Great job!",
      description: "You've successfully added a tag to your document.",
      duration: 3000,
    })
    markStepComplete("metadata-try")
    setTimeout(nextStep, 1500)
  }

  const handleTryLogic = () => {
    toast({
      title: "Personality selected!",
      description: "The Business Analyst personality will focus on strategic insights.",
      duration: 3000,
    })
    markStepComplete("logic-try")
    setTimeout(nextStep, 1500)
  }

  const handleTryAction = () => {
    toast({
      title: "Analysis started!",
      description: "Your document is being analyzed. Results will appear soon.",
      duration: 3000,
    })
    markStepComplete("action-try")
    setTimeout(nextStep, 1500)
  }

  return (
    <>
      {/* Welcome Modal */}
      <OnboardingModal
        step="welcome"
        title="Welcome to Semantic Layer!"
        description="Let's quickly show you how we help you tag, process, and act on your documents with our three-layer approach. We'll walk through Metadata for tagging, Logic for agent personalities, and Action for integrations."
        actionLabel="Start Tour"
      />

      {/* Metadata Layer */}
      <OnboardingTooltip
        step="metadata"
        targetSelector="#metadata-layer-button"
        title="Metadata Layer"
        description="We analyze your document and suggest helpful tags (topics, organizations, etc.). You can edit or add your own tags and organize document structure."
        position="right"
        showTryIt={true}
        onTryIt={() => nextStep()}
      />

      {/* Metadata Try It */}
      <OnboardingTooltip
        step="metadata-try"
        targetSelector="button[data-add-tag]"
        title="Try adding a tag"
        description="Click here to add your own custom tag to the document. Tags help organize and find information later."
        position="bottom"
        showTryIt={true}
        onTryIt={handleTryMetadata}
      />

      {/* Logic Layer */}
      <OnboardingTooltip
        step="logic"
        targetSelector="[data-layer='logic']"
        title="Logic Layer"
        description="Choose from built-in personalities—like 'Business Analyst' or 'Professor'—which shape how we interpret your document."
        position="right"
        showTryIt={true}
        onTryIt={() => nextStep()}
      />

      {/* Logic Try It */}
      <OnboardingTooltip
        step="logic-try"
        targetSelector=".border.rounded-lg.p-3.cursor-pointer" // Target the first personality card
        title="Select a personality"
        description="Try selecting the Business Analyst personality to analyze your document from a strategic business perspective."
        position="bottom"
        showTryIt={true}
        onTryIt={handleTryLogic}
      />

      {/* Action Layer */}
      <OnboardingTooltip
        step="action"
        targetSelector="[data-layer='action']"
        title="Action Layer"
        description="Run your analysis, schedule automations, and integrate with third-party tools. See results in real-time and share with your team."
        position="right"
        showTryIt={true}
        onTryIt={() => nextStep()}
      />

      {/* Action Try It */}
      <OnboardingTooltip
        step="action-try"
        targetSelector="[data-action='generate-summary']"
        title="Run an analysis"
        description="Try generating a summary of your document. This will analyze the content and create an executive summary."
        position="bottom"
        showTryIt={true}
        onTryIt={handleTryAction}
      />

      {/* Completion Modal */}
      <OnboardingModal
        step="complete"
        title="You're all set!"
        description="Congratulations! You've completed the tour of our three-layer system. Now you can fully explore the platform and harness the power of metadata tagging, agent-based logic, and integrated actions."
        actionLabel="Get Started"
        showSkip={false}
        showReset={true} // Add this prop
      />

      {/* Floating Next Button */}
      {currentStep && currentStep !== "complete" && (
        <div className="fixed bottom-8 right-8 z-[110]">
          <Button
            size="lg"
            onClick={nextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-lg"
          >
            Continue Onboarding
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  )
}

