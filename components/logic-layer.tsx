"use client"

import type React from "react"

import { useState } from "react"
import {
  User,
  Brain,
  Briefcase,
  Beaker,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  X,
  ArrowRight,
  Settings,
  Play,
  Zap,
  Layers,
  MessageSquare,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

interface CustomPersonality {
  id: string
  name: string
  description: string
  focus: string[]
  tone: "academic" | "business" | "technical" | "casual"
  expertise: string[]
  icon: React.ReactNode
  color: string
  isAiSuggested?: boolean
}

interface CustomPersonalityFormProps {
  personality?: CustomPersonality
  onSave: (data: Omit<CustomPersonality, "id" | "icon" | "color">) => void
  onCancel: () => void
}

export function CustomPersonalityForm({ personality, onSave, onCancel }: CustomPersonalityFormProps) {
  const [name, setName] = useState(personality?.name || "")
  const [description, setDescription] = useState(personality?.description || "")
  const [focus, setFocus] = useState(personality?.focus.join(", ") || "")
  const [tone, setTone] = useState<"academic" | "business" | "technical" | "casual">(personality?.tone || "academic")
  const [expertise, setExpertise] = useState(personality?.expertise.join(", ") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      focus: focus.split(",").map((item) => item.trim()),
      tone,
      expertise: expertise.split(",").map((item) => item.trim()),
      isAiSuggested: personality?.isAiSuggested,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-3">
      <div>
        <Label htmlFor="name" className="text-xs">
          Personality Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 text-xs h-7"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-xs">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 text-xs"
          rows={2}
          required
        />
      </div>

      <div>
        <Label htmlFor="focus" className="text-xs">
          Focus Areas (comma-separated)
        </Label>
        <Input
          id="focus"
          type="text"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="w-full mt-1 text-xs h-7"
          placeholder="e.g. Technical concepts, Implementation details"
          required
        />
      </div>

      <div>
        <Label htmlFor="tone" className="text-xs">
          Tone
        </Label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
          className="w-full mt-1 border rounded-md px-2 py-1 text-xs h-7"
          required
        >
          <option value="academic">Academic</option>
          <option value="business">Business</option>
          <option value="technical">Technical</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      <div>
        <Label htmlFor="expertise" className="text-xs">
          Areas of Expertise (comma-separated)
        </Label>
        <Input
          id="expertise"
          type="text"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          className="w-full mt-1 text-xs h-7"
          placeholder="e.g. Software development, System design"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          size="sm"
          className="h-7 text-xs border-gray-300 bg-white hover:bg-gray-50 text-[#5f6368]"
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-7 text-xs bg-[#1a73e8] hover:bg-[#174ea6] text-white">
          {personality ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}

// Update the interface to remove documentId
interface LogicLayerProps {
  analysis: SemanticAnalysis | null
  onPersonalityChange?: (personalityId: string) => void
}

// Update the function signature to remove documentId
export function LogicLayer({ analysis, onPersonalityChange }: LogicLayerProps) {
  const [activePersonality, setActivePersonality] = useState<string | null>(null)
  const [semanticDepth, setSemanticDepth] = useState(3)
  const [patternRecognition, setPatternRecognition] = useState(75)
  const [contextAwareness, setContextAwareness] = useState(3)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showCustomPersonalityForm, setShowCustomPersonalityForm] = useState(false)
  const [editingPersonality, setEditingPersonality] = useState<CustomPersonality | null>(null)
  const [activeTab, setActiveTab] = useState<"personalities" | "settings" | "workflow">("personalities")
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const { toast } = useToast()

  // Replace the processingRules state with agentStrengths
  const [agentStrengths, setAgentStrengths] = useState({
    topicAnalysis: 75,
    entityRecognition: 60,
    sentimentAnalysis: 50,
    contextualUnderstanding: 80,
    domainSpecificKnowledge: 65,
    hierarchicalThinking: 70,
  })

  // Model selection
  const [selectedModel, setSelectedModel] = useState("standard")

  // Predefined personalities
  const [personalities, setPersonalities] = useState<CustomPersonality[]>([
    {
      id: "professor",
      name: "Professor",
      description: "Academic perspective focusing on educational content",
      focus: ["Educational content", "Research", "Academic analysis"],
      tone: "academic",
      expertise: ["Education", "Research methodology", "Academic writing"],
      icon: <Brain className="h-3.5 w-3.5" />,
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "business_analyst",
      name: "Business Analyst",
      description: "Business-oriented perspective focusing on strategic insights",
      focus: ["Strategic insights", "Market analysis", "Business opportunities"],
      tone: "business",
      expertise: ["Business strategy", "Market research", "Financial analysis"],
      icon: <Briefcase className="h-3.5 w-3.5" />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "technical_expert",
      name: "Technical Expert",
      description: "Technical perspective focusing on implementation details",
      focus: ["Implementation details", "Technical architecture", "Code quality"],
      tone: "technical",
      expertise: ["Software development", "System design", "Technical documentation"],
      icon: <Beaker className="h-3.5 w-3.5" />,
      color: "bg-emerald-100 text-emerald-800",
    },
  ])

  // AI-suggested personalities based on document content
  const [suggestedPersonalities, setSuggestedPersonalities] = useState<CustomPersonality[]>([])

  // Add a new state for tracking selected agents for actions
  const [selectedAgentsForActions, setSelectedAgentsForActions] = useState<string[]>([])
  const [isSelectingAgents, setIsSelectingAgents] = useState(false)

  // Workflow configuration
  const [workflowType, setWorkflowType] = useState<"sequential" | "parallel">("sequential")
  const [workflowActions, setWorkflowActions] = useState<string[]>(["summarize", "analyze", "extract"])
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false)
  const [workflowProgress, setWorkflowProgress] = useState(0)

  // Add a new state to track whether the workflow dialog is open
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false)

  // Add this function to open the workflow dialog
  const openWorkflowDialog = () => {
    setIsWorkflowDialogOpen(true)
  }

  // Add this function to close the workflow dialog
  const closeWorkflowDialog = () => {
    setIsWorkflowDialogOpen(false)
  }

  // Add a function to toggle agent selection for actions
  const toggleAgentSelection = (personalityId: string) => {
    setSelectedAgentsForActions((prev) =>
      prev.includes(personalityId) ? prev.filter((id) => id !== personalityId) : [...prev, personalityId],
    )

    toast({
      title: selectedAgentsForActions.includes(personalityId) ? "Agent removed" : "Agent selected",
      description: selectedAgentsForActions.includes(personalityId)
        ? "Agent removed from workflow"
        : "Agent added to workflow",
    })
  }

  const handlePersonalityChange = (personalityId: string) => {
    const newPersonality = personalityId === activePersonality ? null : personalityId
    setActivePersonality(newPersonality)

    // Notify parent component
    if (onPersonalityChange) {
      onPersonalityChange(newPersonality || "")
    }
  }

  // Replace the handleProcessingRuleChange function with handleStrengthChange
  const handleStrengthChange = (strength: keyof typeof agentStrengths, value: number) => {
    setAgentStrengths((prev) => ({
      ...prev,
      [strength]: value,
    }))
  }

  const handleSaveCustomization = () => {
    setIsSaving(true)

    // Simulate API call to save customization
    setTimeout(() => {
      setIsSaving(false)
      setIsCustomizing(false)

      toast({
        title: "Settings saved",
        description: "Your agent settings have been updated successfully.",
      })
    }, 1500)
  }

  const getDepthLabel = (depth: number) => {
    switch (depth) {
      case 1:
        return "Basic"
      case 2:
        return "Standard"
      case 3:
        return "Advanced"
      default:
        return "Custom"
    }
  }

  // Update the handleSaveCustomPersonality function to close the personality interface after saving
  const handleSaveCustomPersonality = (personalityData: Omit<CustomPersonality, "id" | "icon" | "color">) => {
    // Ensure focus and expertise are arrays
    const focus = Array.isArray(personalityData.focus)
      ? personalityData.focus
      : typeof personalityData.focus === "string"
        ? [personalityData.focus]
        : []

    const expertise = Array.isArray(personalityData.expertise)
      ? personalityData.expertise
      : typeof personalityData.expertise === "string"
        ? [personalityData.expertise]
        : []

    // If editing an existing personality
    if (editingPersonality) {
      const updatedPersonalities = personalities.map((p) =>
        p.id === editingPersonality.id
          ? {
              ...p,
              name: personalityData.name,
              description: personalityData.description,
              focus,
              tone: personalityData.tone,
              expertise,
            }
          : p,
      )

      setPersonalities(updatedPersonalities)
      setEditingPersonality(null)
      setShowCustomPersonalityForm(false)
      setShowPersonalityInterface(false)

      toast({
        title: "Personality updated",
        description: `${personalityData.name} has been updated successfully.`,
      })

      return
    }

    // Generate a unique ID
    const id = `custom_${Date.now()}`

    // Determine icon and color based on tone
    let icon = <User className="h-3.5 w-3.5" key="user-icon" />
    let color = "bg-gray-100 text-gray-800"

    switch (personalityData.tone) {
      case "academic":
        icon = <Brain className="h-3.5 w-3.5" key="brain-icon" />
        color = "bg-purple-100 text-purple-800"
        break
      case "business":
        icon = <Briefcase className="h-3.5 w-3.5" key="briefcase-icon" />
        color = "bg-blue-100 text-blue-800"
        break
      case "technical":
        icon = <Beaker className="h-3.5 w-3.5" key="beaker-icon" />
        color = "bg-emerald-100 text-emerald-800"
        break
      case "casual":
        icon = <User className="h-3.5 w-3.5" key="casual-icon" />
        color = "bg-amber-100 text-amber-800"
        break
    }

    // Create the new personality
    const newPersonality = {
      id,
      ...personalityData,
      focus,
      expertise,
      icon,
      color,
    }

    // Add to personalities list
    setPersonalities([...personalities, newPersonality])

    // Close the form and personality interface
    setShowCustomPersonalityForm(false)
    setShowPersonalityInterface(false)

    // Optionally select the new personality
    setActivePersonality(id)
    if (onPersonalityChange) {
      onPersonalityChange(id)
    }

    toast({
      title: "Personality created",
      description: `${personalityData.name} has been added to your personalities.`,
    })
  }

  // Update the addSuggestedPersonality function to close the personality interface after adding
  const addSuggestedPersonality = (personality: CustomPersonality) => {
    // Make sure focus and expertise are arrays
    const focus = Array.isArray(personality.focus)
      ? personality.focus
      : typeof personality.focus === "string"
        ? [personality.focus]
        : []

    const expertise = Array.isArray(personality.expertise)
      ? personality.expertise
      : typeof personality.expertise === "string"
        ? [personality.expertise]
        : []

    // Add the suggested personality to the regular personalities list
    const newPersonality = {
      ...personality,
      id: `custom_${Date.now()}`, // Generate a new ID
      isAiSuggested: false, // No longer marked as suggested
      focus,
      expertise,
    }

    setPersonalities([...personalities, newPersonality])

    // Remove from suggestions
    setSuggestedPersonalities(suggestedPersonalities.filter((p) => p.id !== personality.id))

    // Select the new personality
    setActivePersonality(newPersonality.id)
    if (onPersonalityChange) {
      onPersonalityChange(newPersonality.id)
    }

    toast({
      title: "Personality added",
      description: `${personality.name} has been added to your personalities.`,
    })
  }

  // Update the generatePersonalitySuggestions function to properly capture and use the live document content
  const generatePersonalitySuggestions = async () => {
    setIsGeneratingSuggestions(true)

    try {
      // Get the ACTUAL document content from the editor
      const editorElement = document.querySelector('[contenteditable="true"]')
      if (!editorElement) {
        throw new Error("Editor element not found")
      }

      // Get the raw HTML content
      const rawContent = editorElement.innerHTML

      // Extract plain text to avoid HTML tags confusing the AI
      const plainText = rawContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      // Get the current document title
      const titleElement = document.querySelector("input[value]")
      const title = titleElement?.value || "Untitled document"

      console.log("Generating suggestions based on live document content:", {
        contentLength: plainText.length,
        titleLength: title.length,
        contentPreview: plainText.substring(0, 100) + "...",
      })

      // Check if we need to analyze the document first
      let currentAnalysis = analysis
      if (!currentAnalysis || (currentAnalysis.topics.length === 0 && currentAnalysis.entities.length === 0)) {
        toast({
          title: "Analyzing document",
          description: "Analyzing current document content before generating suggestions...",
        })

        try {
          // Call the document analysis API with the LIVE content
          const analysisResult = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentId: "global-document",
              content: plainText,
              title,
            }),
          })

          if (!analysisResult.ok) {
            throw new Error("Failed to analyze document")
          }

          const analysisData = await analysisResult.json()
          currentAnalysis = analysisData.analysis
        } catch (error) {
          console.error("Error analyzing document:", error)
          toast({
            title: "Analysis failed",
            description: "There was an error analyzing your document. Please try again.",
            variant: "destructive",
          })
          setIsGeneratingSuggestions(false)
          return
        }
      }

      // Now call the API to suggest personalities with the LIVE content and analysis data
      const response = await fetch("/api/suggest-personalities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: plainText,
          title,
          analysis: currentAnalysis,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate personality suggestions")
      }

      const data = await response.json()

      // Transform API response into CustomPersonality objects
      const suggestions: CustomPersonality[] = data.suggestions.map((suggestion: any) => {
        // Determine icon and color based on tone
        let icon = <User className="h-3.5 w-3.5" key="user-icon" />
        let color = "bg-gray-100 text-gray-800"

        switch (suggestion.tone) {
          case "academic":
            icon = <Brain className="h-3.5 w-3.5" key="brain-icon" />
            color = "bg-purple-100 text-purple-800"
            break
          case "business":
            icon = <Briefcase className="h-3.5 w-3.5" key="briefcase-icon" />
            color = "bg-blue-100 text-blue-800"
            break
          case "technical":
            icon = <Beaker className="h-3.5 w-3.5" key="beaker-icon" />
            color = "bg-emerald-100 text-emerald-800"
            break
          case "casual":
            icon = <User className="h-3.5 w-3.5" key="casual-icon" />
            color = "bg-amber-100 text-amber-800"
            break
        }

        return {
          id: `suggested_${suggestion.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
          name: suggestion.name,
          description: suggestion.description,
          focus: suggestion.focus,
          tone: suggestion.tone,
          expertise: suggestion.expertise,
          icon,
          color,
          isAiSuggested: true,
        }
      })

      setSuggestedPersonalities(suggestions)

      toast({
        title: "Suggestions generated",
        description: `${suggestions.length} personality suggestions based on your current document content.`,
      })
    } catch (error) {
      console.error("Error generating personality suggestions:", error)

      toast({
        title: "Error generating suggestions",
        description: "There was a problem generating personality suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // Function to run the workflow
  const runWorkflow = () => {
    if (selectedAgentsForActions.length === 0) {
      toast({
        title: "No agents selected",
        description: "Please select at least one agent to run the workflow",
        variant: "destructive",
      })
      return
    }

    setIsRunningWorkflow(true)
    setWorkflowProgress(0)

    // Simulate workflow progress
    const interval = setInterval(() => {
      setWorkflowProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunningWorkflow(false)

          toast({
            title: "Workflow completed",
            description: `${selectedAgentsForActions.length} agents processed the document successfully`,
          })

          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  // Update the LogicLayer component to hide personalities by default and only show options when "Create New Personality" is clicked

  // Add a new state to track whether the personality creation interface should be shown
  const [showPersonalityInterface, setShowPersonalityInterface] = useState(false)

  const handleEditPersonality = (personality: CustomPersonality) => {
    setEditingPersonality(personality)
    setShowCustomPersonalityForm(true)
  }

  const handleDeletePersonality = (personalityId: string) => {
    setPersonalities((prevPersonalities) => prevPersonalities.filter((p) => p.id !== personalityId))
    setActivePersonality(null)
    if (onPersonalityChange) {
      onPersonalityChange("")
    }
    toast({
      title: "Personality deleted",
      description: "The personality has been deleted successfully.",
    })
  }

  const formatStrengthLabel = (strength: string) => {
    switch (strength) {
      case "topicAnalysis":
        return "Topic Analysis"
      case "entityRecognition":
        return "Entity Recognition"
      case "sentimentAnalysis":
        return "Sentiment Analysis"
      case "contextualUnderstanding":
        return "Contextual Understanding"
      case "domainSpecificKnowledge":
        return "Domain-Specific Knowledge"
      case "hierarchicalThinking":
        return "Hierarchical Thinking"
      default:
        return strength
    }
  }

  return (
    <div className="h-full overflow-auto p-2 space-y-2">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="h-7 p-0.5 bg-transparent border-b rounded-none w-full justify-start gap-4">
            <TabsTrigger
              value="personalities"
              className="text-[10px] font-sans font-normal h-6 px-2 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
            >
              Personalities
            </TabsTrigger>
            <TabsTrigger
              value="workflow"
              className="text-[10px] font-sans font-normal h-6 px-2 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
            >
              Workflow
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-[10px] font-sans font-normal h-6 px-2 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Modify the personalities tab content to conditionally render based on the showPersonalityInterface state */}
        {/* Replace the existing TabsContent for "personalities" with this updated version: */}
        <TabsContent value="personalities" className="mt-0 space-y-2">
          {!showPersonalityInterface ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center mb-1 font-sans font-normal h-6 text-xs border-gray-300 bg-white hover:bg-gray-50 text-[#1a73e8] hover:text-[#174ea6]"
                onClick={() => setShowPersonalityInterface(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create New Personality
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center mb-2 font-sans font-normal h-6 text-xs border-gray-300 bg-white hover:bg-gray-50 text-[#1a73e8] hover:text-[#174ea6]"
                onClick={generatePersonalitySuggestions}
                disabled={isGeneratingSuggestions}
              >
                {isGeneratingSuggestions ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>

              {/* Only show active personalities in a dotted border container */}
              {activePersonality && (
                <div className="mt-2 border border-dashed border-[#1a73e8]/50 rounded-md p-2 bg-[#f8faff]">
                  <h3 className="text-xs font-sans font-medium text-[#1a73e8] mb-1">Active Agent for Document</h3>
                  {personalities
                    .filter((p) => p.id === activePersonality)
                    .map((personality) => (
                      <div
                        key={personality.id}
                        data-personality={personality.id}
                        className="border border-gray-200 rounded-sm p-1.5 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className={`${personality.color} p-1 rounded-full mr-1.5`}>{personality.icon}</div>
                            <div>
                              <h4 className="text-xs font-medium font-sans">{personality.name}</h4>
                              <p className="text-[9px] text-gray-500 font-sans font-normal">
                                {personality.description}
                              </p>

                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {personality.focus &&
                                  Array.isArray(personality.focus) &&
                                  personality.focus.slice(0, 2).map((item, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-[9px] bg-gray-50 font-sans font-normal py-0 px-1 h-4"
                                    >
                                      {item}
                                    </Badge>
                                  ))}
                                {personality.focus &&
                                  Array.isArray(personality.focus) &&
                                  personality.focus.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] bg-gray-50 font-sans font-normal py-0 px-1 h-4"
                                    >
                                      +{personality.focus.length - 2}
                                    </Badge>
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditPersonality(personality)
                                      setShowPersonalityInterface(true)
                                    }}
                                  >
                                    <Edit className="h-2.5 w-2.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="font-sans font-normal text-xs">Edit</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeletePersonality(personality.id)
                                    }}
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="font-sans font-normal text-xs">Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Available personalities section */}
              <div className="mt-3">
                <h3 className="text-xs font-sans font-medium text-[#5f6368] mb-1">Available Personalities</h3>
                <div className="space-y-1.5">
                  {personalities.map((personality) => (
                    <div
                      key={personality.id}
                      data-personality={personality.id}
                      className={`border rounded-md p-2 cursor-pointer ${
                        activePersonality === personality.id
                          ? "border-blue-200 bg-blue-50"
                          : isSelectingAgents && selectedAgentsForActions.includes(personality.id)
                            ? "border-green-200 bg-green-50"
                            : "hover:border-blue-200 hover:bg-blue-50"
                      }`}
                      onClick={() => {
                        if (isSelectingAgents) {
                          toggleAgentSelection(personality.id)
                        } else {
                          handlePersonalityChange(personality.id)
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className={`${personality.color} p-1.5 rounded-full mr-2`}>{personality.icon}</div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-xs">{personality.name}</h4>
                            {isSelectingAgents && selectedAgentsForActions.includes(personality.id) && (
                              <Badge className="ml-2 bg-green-100 text-green-800 text-[8px]">Selected</Badge>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-500">{personality.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {showCustomPersonalityForm ? (
                <CustomPersonalityForm
                  personality={editingPersonality || undefined}
                  onSave={handleSaveCustomPersonality}
                  onCancel={() => {
                    setShowCustomPersonalityForm(false)
                    setEditingPersonality(null)
                    setShowPersonalityInterface(false)
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-sans font-medium text-[#5f6368]">Select Personality Type</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowPersonalityInterface(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="border rounded-md p-2 cursor-pointer hover:border-blue-200 hover:bg-blue-50"
                      onClick={() => setShowCustomPersonalityForm(true)}
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                          <User className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium">Custom</h4>
                          <p className="text-[10px] text-gray-500">Create your own personality</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="border rounded-md p-2 cursor-pointer hover:border-purple-200 hover:bg-purple-50"
                      onClick={() => {
                        // Pre-fill academic personality
                        setEditingPersonality({
                          id: "",
                          name: "Academic",
                          description: "Academic perspective with educational focus",
                          focus: ["Research", "Education", "Analysis"],
                          tone: "academic",
                          expertise: ["Academic writing", "Research methodology"],
                          icon: <Brain className="h-3.5 w-3.5" />,
                          color: "bg-purple-100 text-purple-800",
                        })
                        setShowCustomPersonalityForm(true)
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                          <Brain className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium">Academic</h4>
                          <p className="text-[10px] text-gray-500">Educational perspective</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="border rounded-md p-2 cursor-pointer hover:border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        // Pre-fill business personality
                        setEditingPersonality({
                          id: "",
                          name: "Business Analyst",
                          description: "Business-oriented strategic analysis",
                          focus: ["Strategy", "Market analysis", "Business insights"],
                          tone: "business",
                          expertise: ["Business strategy", "Market research"],
                          icon: <Briefcase className="h-3.5 w-3.5" />,
                          color: "bg-blue-100 text-blue-800",
                        })
                        setShowCustomPersonalityForm(true)
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                          <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium">Business</h4>
                          <p className="text-[10px] text-gray-500">Strategic business focus</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="border rounded-md p-2 cursor-pointer hover:border-green-200 hover:bg-green-50"
                      onClick={() => {
                        // Pre-fill technical personality
                        setEditingPersonality({
                          id: "",
                          name: "Technical Expert",
                          description: "Technical implementation details",
                          focus: ["Implementation", "Architecture", "Code quality"],
                          tone: "technical",
                          expertise: ["Software development", "System design"],
                          icon: <Beaker className="h-3.5 w-3.5" />,
                          color: "bg-emerald-100 text-emerald-800",
                        })
                        setShowCustomPersonalityForm(true)
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-green-100 p-1.5 rounded-full mr-2">
                          <Beaker className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium">Technical</h4>
                          <p className="text-[10px] text-gray-500">Technical implementation focus</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI Suggestions Section - Redesigned to be visually distinct */}
          {suggestedPersonalities.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <h3 className="text-xs font-medium text-blue-800">AI-Generated Suggestions</h3>
                </div>
                <p className="text-[9px] text-blue-600 italic">
                  These personalities were intelligently generated based on your document content.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {suggestedPersonalities.map((personality) => (
                  <div
                    key={personality.id}
                    className="bg-blue-50 border border-blue-200 rounded-md p-2 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="bg-white p-1.5 rounded-full shadow-sm mr-2">
                        <div className={`${personality.color} p-1 rounded-full`}>{personality.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h4 className="text-xs font-medium">{personality.name}</h4>
                            <Badge className="ml-1 bg-blue-100 text-blue-800 text-[8px]">AI</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 text-[8px] font-sans font-normal px-1.5 bg-white"
                              onClick={() => addSuggestedPersonality(personality)}
                            >
                              <Plus className="h-2 w-2 mr-0.5" />
                              Add
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[8px] font-sans font-normal px-1.5"
                              onClick={() => {
                                setEditingPersonality(personality)
                                setShowCustomPersonalityForm(true)
                                setShowPersonalityInterface(true)
                              }}
                            >
                              <Edit className="h-2 w-2 mr-0.5" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-600 mt-0.5">{personality.description}</p>

                        {personality.focus && Array.isArray(personality.focus) && personality.focus.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[8px] text-gray-500 mr-0.5">Focus:</span>
                            {personality.focus.slice(0, 2).map((item, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-[8px] bg-white font-sans font-normal py-0 px-1 h-3.5"
                              >
                                {item}
                              </Badge>
                            ))}
                            {personality.focus.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-[8px] bg-white font-sans font-normal py-0 px-1 h-3.5"
                              >
                                +{personality.focus.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate AI Suggestions button - Keep this section as is */}
          {suggestedPersonalities.length === 0 && !isGeneratingSuggestions && (
            <div className="flex justify-center mt-3">{/* Remove this button since we moved it to the top */}</div>
          )}

          {/* Loading state for generating suggestions - Keep this section as is */}
          {isGeneratingSuggestions && (
            <div className="text-center py-4 border rounded-md bg-blue-50/30 border-blue-100 mt-3">
              <RefreshCw className="h-8 w-8 mx-auto text-blue-400 mb-2 animate-spin" />
              <h3 className="text-sm font-medium mb-1 font-sans text-blue-700">Generating Suggestions...</h3>
              <p className="text-xs text-blue-600 mb-3 font-sans font-normal px-4">
                Analyzing your document content to create personalized AI personality suggestions.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Replace the Workflow Integration Playground Tab with this cleaner, dialog-like version */}
        <TabsContent value="workflow" className="mt-0">
          <div className="p-4 border rounded-lg bg-white">
            <h3 className="text-sm font-medium mb-3">Agent Workflow Integration</h3>
            <p className="text-xs text-gray-600 mb-4">
              Configure and run workflows with your selected agent personalities to process documents automatically.
            </p>

            {selectedAgentsForActions.length > 0 ? (
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <h4 className="text-xs font-medium mb-2">Selected Agents</h4>
                <div className="flex flex-wrap gap-2">
                  {personalities
                    .filter((p) => selectedAgentsForActions.includes(p.id))
                    .map((personality) => (
                      <div
                        key={personality.id}
                        className="flex items-center bg-white rounded-full pl-1 pr-2 py-1 border"
                      >
                        <div className={`${personality.color} p-1 rounded-full mr-1.5`}>{personality.icon}</div>
                        <span className="text-xs font-medium">{personality.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 border border-dashed rounded-lg text-center">
                <p className="text-sm text-gray-500">No agents selected</p>
                <p className="text-xs text-gray-400">Select agents from the Personalities tab</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setIsSelectingAgents(!isSelectingAgents)
                  setActiveTab("personalities")
                }}
                variant="outline"
                size="sm"
                className="w-full justify-center h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                {isSelectingAgents ? "Done Selecting Agents" : "Select Agents"}
              </Button>

              <Button
                onClick={openWorkflowDialog}
                variant="default"
                size="sm"
                className="w-full justify-center h-8 text-xs bg-blue-600 hover:bg-blue-700"
                disabled={selectedAgentsForActions.length === 0}
              >
                <Workflow className="h-3 w-3 mr-1.5" />
                Open Workflow Dialog
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0 space-y-3">
          <div className="border border-gray-200 rounded-sm p-2.5 bg-white">
            <h3 className="text-xs font-sans font-normal text-[#5f6368] mb-3">Agent Processing Settings</h3>

            <div className="space-y-4">
              {Object.entries(agentStrengths).map(([strength, value]) => (
                <div key={strength} className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor={strength} className="text-[10px] font-sans font-normal">
                      {formatStrengthLabel(strength)}
                    </Label>
                    <span className="text-[10px] font-medium font-sans">{value}%</span>
                  </div>
                  <Slider
                    id={strength}
                    min={0}
                    max={100}
                    step={5}
                    value={[value]}
                    onValueChange={(values) => handleStrengthChange(strength as keyof typeof agentStrengths, values[0])}
                    className="h-1.5"
                  />
                </div>
              ))}

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="semanticDepth" className="text-[10px] font-sans font-normal">
                    Semantic Depth
                  </Label>
                  <span className="text-[10px] font-medium font-sans">{getDepthLabel(semanticDepth)}</span>
                </div>
                <Slider
                  id="semanticDepth"
                  min={1}
                  max={5}
                  step={1}
                  value={[semanticDepth]}
                  onValueChange={(values) => setSemanticDepth(values[0])}
                  className="h-1.5"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="contextAwareness" className="text-[10px] font-sans font-normal">
                    Context Awareness
                  </Label>
                  <span className="text-[10px] font-medium font-sans">{contextAwareness} levels</span>
                </div>
                <Slider
                  id="contextAwareness"
                  min={1}
                  max={5}
                  step={1}
                  value={[contextAwareness]}
                  onValueChange={(values) => setContextAwareness(values[0])}
                  className="h-1.5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-0.5">
                  <Label htmlFor="modelSelection" className="text-[10px] font-sans font-normal">
                    AI Model Selection
                  </Label>
                  <span className="text-[9px] text-gray-500 font-sans font-normal">Choose model for your agent</span>
                </div>
                <select
                  id="modelSelection"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-1/3 border rounded-md px-2 py-1 text-[10px] font-sans font-normal h-6"
                >
                  <option value="standard">Standard</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autoSuggest" className="data-[state=checked]:bg-blue-600" />
                <Label htmlFor="autoSuggest" className="text-[10px] font-sans font-normal">
                  Auto-suggest personalities based on document content
                </Label>
              </div>
            </div>

            <Button
              className="w-full mt-4 font-sans font-normal text-xs h-7 bg-[#1a73e8] hover:bg-[#174ea6] text-white"
              onClick={handleSaveCustomization}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1.5" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      {isWorkflowDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Workflow className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-medium">Workflow Integration</h2>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeWorkflowDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Dialog Content */}
            <div className="p-4 space-y-4">
              {/* Selected Agents Display */}
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Agents</h4>

                {selectedAgentsForActions.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {personalities
                      .filter((p) => selectedAgentsForActions.includes(p.id))
                      .map((personality, index) => (
                        <div
                          key={personality.id}
                          className="flex items-center bg-gray-50 rounded-full pl-1 pr-2 py-1 border border-gray-200"
                        >
                          <div className={`${personality.color} p-1 rounded-full mr-1.5`}>{personality.icon}</div>
                          <span className="text-xs font-medium">{personality.name}</span>
                          {workflowType === "sequential" && index < selectedAgentsForActions.length - 1 && (
                            <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-3 border border-dashed border-gray-200 rounded-md">
                    <p className="text-sm text-gray-500">No agents selected for this workflow</p>
                    <p className="text-xs text-gray-400 mt-1">Go to the Personalities tab to select agents</p>
                  </div>
                )}
              </div>

              {/* Workflow Configuration */}
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Workflow Configuration</h4>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="workflowType" className="text-xs text-gray-700 mb-1 block">
                      Workflow Type
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={workflowType === "sequential" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 text-xs ${workflowType === "sequential" ? "bg-blue-600" : "border-gray-300"}`}
                        onClick={() => setWorkflowType("sequential")}
                      >
                        <ArrowRight className="h-3 w-3 mr-1.5" />
                        Sequential
                      </Button>
                      <Button
                        type="button"
                        variant={workflowType === "parallel" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 text-xs ${workflowType === "parallel" ? "bg-blue-600" : "border-gray-300"}`}
                        onClick={() => setWorkflowType("parallel")}
                      >
                        <Layers className="h-3 w-3 mr-1.5" />
                        Parallel
                      </Button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {workflowType === "sequential"
                        ? "Agents process the document one after another in sequence"
                        : "All agents process the document simultaneously"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="workflowActions" className="text-xs text-gray-700 mb-1 block">
                      Actions to Perform
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="summarize"
                          checked={workflowActions.includes("summarize")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWorkflowActions((prev) => [...prev, "summarize"])
                            } else {
                              setWorkflowActions((prev) => prev.filter((a) => a !== "summarize"))
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor="summarize" className="text-xs cursor-pointer">
                          <div className="flex items-center">
                            <FileText_Workflow className="h-3 w-3 mr-1 text-blue-600" />
                            Summarize
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="analyze"
                          checked={workflowActions.includes("analyze")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWorkflowActions((prev) => [...prev, "analyze"])
                            } else {
                              setWorkflowActions((prev) => prev.filter((a) => a !== "analyze"))
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor="analyze" className="text-xs cursor-pointer">
                          <div className="flex items-center">
                            <Layers className="h-3 w-3 mr-1 text-blue-600" />
                            Analyze
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="extract"
                          checked={workflowActions.includes("extract")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWorkflowActions((prev) => [...prev, "extract"])
                            } else {
                              setWorkflowActions((prev) => prev.filter((a) => a !== "extract"))
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor="extract" className="text-xs cursor-pointer">
                          <div className="flex items-center">
                            <Zap className="h-3 w-3 mr-1 text-blue-600" />
                            Extract
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="chat"
                          checked={workflowActions.includes("chat")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWorkflowActions((prev) => [...prev, "chat"])
                            } else {
                              setWorkflowActions((prev) => prev.filter((a) => a !== "chat"))
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor="chat" className="text-xs cursor-pointer">
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1 text-blue-600" />
                            Chat
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="advancedSettings" className="text-xs text-gray-700 mb-1 block">
                      Advanced Settings
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center h-7 text-xs border-gray-300 bg-white hover:bg-gray-50 text-blue-600"
                      onClick={() => {
                        toast({
                          title: "Advanced settings",
                          description: "Configure advanced workflow settings",
                        })
                      }}
                    >
                      <Settings className="h-3 w-3 mr-1.5" />
                      Configure Advanced Settings
                    </Button>
                  </div>
                </div>
              </div>

              {/* Workflow Execution */}
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Execute Workflow</h4>

                {isRunningWorkflow ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Processing document...</span>
                      <span className="text-xs">{workflowProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${workflowProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>Agents: {selectedAgentsForActions.length}</span>
                      <span>Actions: {workflowActions.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <Workflow className="h-4 w-4 text-blue-600 mr-1.5" />
                          <span className="text-sm font-medium text-gray-800">Ready to Execute</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedAgentsForActions.length} agents will perform {workflowActions.length} actions
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 bg-blue-600 hover:bg-blue-700"
                        onClick={runWorkflow}
                        disabled={selectedAgentsForActions.length === 0 || workflowActions.length === 0}
                      >
                        <Play className="h-3 w-3 mr-1.5" />
                        Run Workflow
                      </Button>
                    </div>

                    {(selectedAgentsForActions.length === 0 || workflowActions.length === 0) && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                        {selectedAgentsForActions.length === 0 ? (
                          <span>Please select at least one agent from the Personalities tab</span>
                        ) : (
                          <span>Please select at least one action to perform</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" size="sm" onClick={closeWorkflowDialog}>
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={runWorkflow}
                disabled={selectedAgentsForActions.length === 0 || workflowActions.length === 0 || isRunningWorkflow}
              >
                {isRunningWorkflow ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1.5" />
                    Run Workflow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// These components are needed for the AI suggestions
function Code(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  )
}

function LineChart(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18"></path>
      <path d="m19 9-5 5-4-4-3 3"></path>
    </svg>
  )
}

function GraduationCap(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-8-4z"></path>
      <path d="M8 5h8"></path>
      <path d="M8 3h8"></path>
      <path d="M12 8v4"></path>
    </svg>
  )
}

function Users(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  )
}

function FileText_Workflow(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" x2="8" y1="13" y2="13"></line>
      <line x1="16" x2="8" y1="17" y2="17"></line>
      <line x1="10" x2="8" y1="9" y2="9"></line>
    </svg>
  )
}

