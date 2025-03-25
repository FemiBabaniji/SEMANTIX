"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ChevronDown,
  Share2,
  Star,
  Clock,
  FileText,
  MoreVertical,
  MessageSquare,
  Users,
  Settings,
  Info,
  Tag,
  Code,
  Play,
  HelpCircle,
} from "lucide-react"
import { QuestionnaireProvider } from "@/components/questionnaire/questionnaire-provider"
import { useToast } from "@/hooks/use-toast"
import { toast } from "@/hooks/use-toast"
import GoogleStyledLogo from "@/components/google-styled-logo"
import { MetadataLayer } from "@/components/metadata-layer"
import { LogicLayer } from "@/components/logic-layer"
import { ActionLayer } from "@/components/action-layer"
import type { SemanticAnalysis } from "@/lib/semantic-processing"
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider"
import { OnboardingController } from "@/components/onboarding/onboarding-controller"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"

// Define questionnaire steps
const questionnaireSteps = [
  {
    id: "satisfaction",
    title: "Document Organization Research",
    description: "Help us understand your document organization needs.",
    fields: [
      {
        id: "satisfaction",
        type: "radio",
        label: "1. How satisfied are you with your current document organization in Google Drive?",
        required: true,
        options: [
          { value: "very_satisfied", label: "Very satisfied" },
          { value: "satisfied", label: "Satisfied" },
          { value: "neutral", label: "Neutral" },
          { value: "dissatisfied", label: "Dissatisfied" },
          { value: "very_dissatisfied", label: "Very dissatisfied" },
        ],
      },
      {
        id: "ai_preference",
        type: "radio",
        label:
          "2. Would you prefer an AI system that learns from your behavior and organizes files automatically, or one that asks for your input before making changes?",
        required: true,
        options: [
          { value: "fully_automatic", label: "Fully automatic organization" },
          { value: "asks_for_input", label: "Asks for my input first" },
          { value: "balanced", label: "A balanced combination of both" },
        ],
      },
      {
        id: "ai_preference_why",
        type: "textarea",
        label: "Why?",
        placeholder: "Please explain your preference briefly",
        helperText: "How much control would you want over how your files are organized?",
      },
    ],
  },
  {
    id: "metadata",
    title: "Metadata & Integration",
    description: "Tell us about your metadata needs and platform usage.",
    fields: [
      {
        id: "useful_metadata",
        type: "checkbox",
        label:
          "3. If AI could automatically generate metadata for your documents, which tags or categories would be most useful? (Select all that apply)",
        options: [
          { value: "document_type", label: "Document type (report, invoice, contract, etc.)" },
          { value: "project_name", label: "Project name or code" },
          { value: "urgency", label: "Urgency or priority" },
          { value: "client_name", label: "Client or partner name" },
          { value: "department", label: "Department or team responsible" },
          { value: "date", label: "Date or timeline" },
          { value: "confidentiality", label: "Confidentiality level (public, internal, confidential)" },
        ],
      },
      {
        id: "other_metadata",
        type: "text",
        label: "Other metadata you'd find useful (optional)",
        placeholder: "Please specify briefly",
      },
    ],
  },
  {
    id: "platforms",
    title: "Platform Integration",
    description: "Tell us about other platforms you use alongside Google Drive.",
    fields: [
      {
        id: "other_platforms",
        type: "checkbox",
        label:
          "4. Do you currently use other platforms alongside Google Drive for document management or collaboration? (Select all that apply)",
        options: [
          { value: "notion", label: "Notion" },
          { value: "slack", label: "Slack" },
          { value: "trello", label: "Trello" },
          { value: "salesforce", label: "Salesforce" },
          { value: "teams", label: "Microsoft Teams" },
          { value: "asana", label: "Asana" },
          { value: "jira", label: "Jira" },
          { value: "google_drive_only", label: "I only use Google Drive" },
        ],
      },
      {
        id: "other_platforms_specify",
        type: "text",
        label: "Others (please specify)",
        placeholder: "Enter other platforms you use",
      },
      {
        id: "cross_platform_management",
        type: "textarea",
        label: "How do you manage documents across these systems?",
        placeholder: "Briefly explain your approach",
      },
      {
        id: "auto_organization",
        type: "radio",
        label:
          "5. Would it be helpful if documents in Google Drive could automatically organize themselves based on data or activity from these external tools?",
        required: true,
        options: [
          { value: "extremely_helpful", label: "Extremely helpful" },
          { value: "somewhat_helpful", label: "Somewhat helpful" },
          { value: "neutral", label: "Neutral" },
          { value: "not_very_helpful", label: "Not very helpful" },
          { value: "not_helpful", label: "Not helpful at all" },
        ],
      },
      {
        id: "workflow_description",
        type: "textarea",
        label: "Can you imagine a workflow where that would save you time or reduce friction?",
        placeholder: "Briefly describe",
      },
    ],
  },
  {
    id: "consistency",
    title: "Metadata Consistency",
    description: "Help us understand the importance of consistent metadata.",
    fields: [
      {
        id: "metadata_consistency",
        type: "radio",
        label:
          "6. How important is it for metadata (tags, document types, categories) to remain consistent across all platforms you use?",
        required: true,
        options: [
          { value: "extremely_important", label: "Extremely important" },
          { value: "very_important", label: "Very important" },
          { value: "somewhat_important", label: "Somewhat important" },
          { value: "slightly_important", label: "Slightly important" },
          { value: "not_important", label: "Not important" },
        ],
      },
      {
        id: "inconsistency_example",
        type: "textarea",
        label: "Do inconsistent labels across systems ever cause confusion or misalignment?",
        placeholder: "Provide a brief example",
      },
    ],
  },
  {
    id: "assistants",
    title: "Virtual Assistants & Concerns",
    description: "Tell us about your preferences for AI assistants and concerns.",
    fields: [
      {
        id: "virtual_assistants",
        type: "radio",
        label:
          '7. How appealing is the idea of personalized virtual assistants or "agents" within Google Drive that help you retrieve information from your documents?',
        required: true,
        options: [
          { value: "very_appealing", label: "Very appealing" },
          { value: "appealing", label: "Appealing" },
          { value: "neutral", label: "Neutral" },
          { value: "unappealing", label: "Unappealing" },
          { value: "very_unappealing", label: "Very unappealing" },
        ],
      },
      {
        id: "ai_concerns",
        type: "radio",
        label: "8. What is your biggest concern with AI-based automatic document organization and analysis?",
        required: true,
        options: [
          { value: "privacy", label: "Privacy and security of data" },
          { value: "loss_of_control", label: "Loss of control over document structure" },
          { value: "accuracy", label: "Accuracy and reliability of AI categorization" },
          { value: "customization", label: "Difficulty customizing to my needs" },
          { value: "none", label: "None, I have no concerns" },
        ],
      },
    ],
  },
  {
    id: "onboarding",
    title: "Onboarding & Success Metrics",
    description: "Help us understand your preferences for onboarding and success measurement.",
    fields: [
      {
        id: "onboarding_preference",
        type: "checkbox",
        label:
          "9. What kind of onboarding support would you prefer when first using an AI-based semantic feature in Google Drive? (Select your top two choices)",
        helperText: "Please select up to two options",
        options: [
          { value: "tutorial", label: "Step-by-step interactive tutorial" },
          { value: "videos", label: "Short instructional videos" },
          { value: "articles", label: "Detailed help articles or FAQs" },
          { value: "chat", label: "Live chat or immediate customer support" },
          { value: "email", label: "Email instructions or quick-start guides" },
        ],
      },
      {
        id: "success_measurement",
        type: "radio",
        label:
          "10. After adopting a semantic-based document management system, how would you primarily measure its success?",
        required: true,
        options: [
          { value: "reduced_time", label: "Reduced time spent locating documents" },
          { value: "easier_integration", label: "Easier integration with external tools" },
          { value: "increased_productivity", label: "Increased productivity or task completion speed" },
          { value: "improved_collaboration", label: "Improved team collaboration" },
          { value: "enhanced_accuracy", label: "Enhanced accuracy of document categorization" },
        ],
      },
    ],
  },
]

// Update the handleQuestionnaireComplete function to ensure onboarding starts after questionnaire closes
const handleQuestionnaireComplete = (responses: any) => {
  console.log("Research questionnaire completed with responses:", responses)

  // Use toast directly instead of from a hook inside a function
  toast({
    title: "Thank you for your feedback!",
    description: "Your responses will help us improve document organization features.",
    duration: 5000,
  })

  // Start onboarding after a short delay to ensure questionnaire is fully closed
  setTimeout(() => {
    if (onboardingStartRef.current) {
      console.log("Starting onboarding after questionnaire completion")
      onboardingStartRef.current()
    }
  }, 1500) // Increased delay to ensure questionnaire modal is fully closed
}

// Mock data for initial render
const initialAnalysis: SemanticAnalysis = {
  topics: [],
  entities: [],
  segments: [],
}

function MainPageContent({ onboardingStartRef }: { onboardingStartRef: React.MutableRefObject<(() => void) | null> }) {
  const [documentTitle, setDocumentTitle] = useState("Prototype for Research")
  const [isSaved, setIsSaved] = useState(true)
  const [activeLayer, setActiveLayer] = useState<"metadata" | "logic" | "action">("metadata")
  const [analysis, setAnalysis] = useState<SemanticAnalysis>(initialAnalysis)
  const editorRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast() // Move useToast hook outside of the component
  const { startOnboarding } = useOnboarding()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Set the onboarding start function in the ref so it can be called from the parent
  useEffect(() => {
    onboardingStartRef.current = startOnboarding
  }, [startOnboarding, onboardingStartRef])

  // Simulate auto-saving
  useEffect(() => {
    if (!isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isSaved])

  const handleEditorChange = () => {
    setIsSaved(false)
  }

  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handlePersonalityChange = (personalityId: string) => {
    // Handle personality change logic here
    console.log("Personality changed:", personalityId)
  }

  const collaborators = [
    { name: "Alex Kim", image: "/placeholder.svg?height=32&width=32" },
    { name: "Jamie Smith", image: "/placeholder.svg?height=32&width=32" },
    { name: "Taylor Wong", image: "/placeholder.svg?height=32&width=32" },
  ]

  // Update the runAnalysis function in app/page.tsx to properly analyze the current document and update the metadata section
  const runAnalysis = () => {
    toast({
      title: "Analysis started",
      description: "Analyzing document content...",
    })

    // Get the current document content from the editor
    const editorElement = document.querySelector('[contenteditable="true"]')
    if (!editorElement) {
      toast({
        title: "Error",
        description: "Could not find document content",
        variant: "destructive",
      })
      return
    }

    const content = editorElement.innerHTML
    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Get the current document title
    const titleElement = document.querySelector("input[value]")
    const title = titleElement?.getAttribute("value") || "Untitled document"

    // Show loading state
    setIsAnalyzing(true)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Call the API to analyze the document
    fetch("/api/analyze", {
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to analyze document")
        }
        return response.json()
      })
      .then((data) => {
        // Update the analysis state with the results
        setAnalysis(data.analysis)

        // Set active tab to metadata to show the results
        setActiveLayer("metadata")

        toast({
          title: "Analysis complete",
          description: "Document has been analyzed successfully.",
          variant: "success",
        })
      })
      .catch((error) => {
        console.error("Error analyzing document:", error)
        toast({
          title: "Analysis failed",
          description: "There was an error analyzing your document. Please try again.",
          variant: "destructive",
        })
      })
      .finally(() => {
        clearInterval(interval)
        setIsAnalyzing(false)
        setAnalysisProgress(0)
      })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center px-4 py-2 border-b">
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center">
            <GoogleStyledLogo width={40} height={40} />
          </div>
          <div className="flex flex-col">
            <Input
              value={documentTitle}
              onChange={(e) => {
                setDocumentTitle(e.target.value)
                setIsSaved(false)
              }}
              className="h-7 text-lg font-normal border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-0 font-sans"
            />
            <div className="flex text-xs space-x-2 text-muted-foreground font-sans">
              <button className="hover:text-foreground font-normal">File</button>
              <button className="hover:text-foreground font-normal">Edit</button>
              <button className="hover:text-foreground font-normal">View</button>
              <button className="hover:text-foreground font-normal">Insert</button>
              <button className="hover:text-foreground font-normal">Format</button>
              <button className="hover:text-foreground font-normal">Tools</button>
              <button className="hover:text-foreground font-normal">Extensions</button>
              <button className="hover:text-foreground font-normal">Help</button>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <div className="text-sm text-muted-foreground font-sans font-normal">
            {isSaved ? "All changes saved" : "Saving..."}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Comments</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="sm" className="gap-1 font-sans font-normal">
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <div className="flex -space-x-2">
            {collaborators.map((user, i) => (
              <Avatar key={i} className="border-2 border-background w-8 h-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          {/* Help button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              try {
                const onboardingState = localStorage.getItem("onboarding-state")
                let parsedState = { completed: false, dismissed: false }

                if (onboardingState) {
                  parsedState = JSON.parse(onboardingState)
                }

                if (!parsedState.completed && !parsedState.dismissed) {
                  console.log("Help button clicked, starting onboarding...")
                  startOnboarding()
                } else {
                  console.log("Onboarding already completed or dismissed, not starting")
                  toast({
                    title: "Onboarding already completed",
                    description: "You can reset onboarding in settings if you want to see it again.",
                    duration: 3000,
                  })
                }
              } catch (e) {
                console.error("Error handling help button click:", e)
                // Fallback to starting onboarding if there's an error
                startOnboarding()
              }
            }}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center px-4 py-1 border-b">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="font-sans font-normal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
          </svg>
        </Button>

        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="font-sans font-normal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
              fill="currentColor"
            />
          </svg>
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 font-sans font-normal">
              Normal text
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="font-sans">
            <DropdownMenuItem onSelect={() => formatText("formatBlock", "<h1>")} className="font-normal">
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => formatText("formatBlock", "<h2>")} className="font-normal">
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => formatText("formatBlock", "<h3>")} className="font-normal">
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => formatText("formatBlock", "<p>")} className="font-normal">
              Normal text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => formatText("bold")} className="font-sans font-normal">
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Bold</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("italic")}
                className="font-sans font-normal"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Italic</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("underline")}
                className="font-sans font-normal"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Underline</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("justifyLeft")}
                className="font-sans font-normal"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Align left</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("justifyCenter")}
                className="font-sans font-normal"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Align center</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("justifyRight")}
                className="font-sans font-normal"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Align right</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("insertUnorderedList")}
                className="font-sans font-normal"
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Bullet list</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatText("insertOrderedList")}
                className="font-sans font-normal"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-sans font-normal">Numbered list</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="ml-auto flex items-center">
          <Button variant="outline" size="sm" className="mr-2 font-sans font-normal" onClick={runAnalysis}>
            <Tag className="h-4 w-4 mr-2" />
            Analyze Document
          </Button>

          <Button variant="ghost" size="icon" className="font-sans font-normal">
            <Users className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="font-sans font-normal">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-sans">
              <DropdownMenuItem className="font-normal">
                <Star className="mr-2 h-4 w-4" />
                <span>Star</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="font-normal">
                <Clock className="mr-2 h-4 w-4" />
                <span>Version history</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-normal">
                <FileText className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="max-w-[850px] mx-auto py-12 px-8">
            <div
              ref={editorRef}
              className="min-h-[calc(100vh-200px)] outline-none prose prose-sm sm:prose lg:prose-lg font-sans"
              contentEditable
              onInput={handleEditorChange}
              suppressContentEditableWarning
            >
              <h1>Welcome to Semantix: A New Google Feature</h1>
              <p>
                This prototype demonstrates how Semantix enhances your document experience with AI-powered analysis and
                organization.
              </p>
              <p>Key features include:</p>
              <ul>
                <li>Automatic document tagging and organization</li>
                <li>AI personalities that analyze your content from different perspectives</li>
                <li>Integration with third-party tools and automation capabilities</li>
                <li>Hierarchical document structure visualization</li>
              </ul>
              <p>Try exploring the sidebar on the right to see these features in action!</p>

              <h2 id="feature-suggestions">Feature Suggestions</h2>
              <p>
                <strong>We value your feedback!</strong> Please document any additional features you believe would
                enhance your experience with Semantix below:
              </p>
              <ol>
                <li>What additional capabilities would make Semantix more valuable to you?</li>
                <li>How would these features improve your workflow?</li>
                <li>Are there specific integrations you'd like to see with other tools?</li>
              </ol>

              <h3>How would these features improve your workflow?</h3>
              <p>Please explain how your suggested features would help you work more efficiently or effectively.</p>
            </div>
          </div>
        </div>

        {/* Semantic Layer Sidebar - now permanent */}
        <div className="w-[280px] shrink-0 flex flex-col border-l h-[calc(100vh-96px)] overflow-hidden">
          <div className="px-2 py-1.5 border-b flex justify-between items-center shrink-0">
            <h3 className="text-sm font-medium text-[#5f6368] font-sans">Semantic Layer Control</h3>
          </div>

          <div className="p-2.5 border-b shrink-0 overflow-y-auto max-h-[25vh]">
            <div className="flex justify-between items-center mb-2.5">
              <h4 className="text-sm font-medium text-[#5f6368] font-sans">Interactive Layers</h4>
              <Button variant="outline" size="sm" className="h-7 text-xs font-sans font-normal px-2.5">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Configure
              </Button>
            </div>

            <div className="space-y-2">
              <div
                data-layer="metadata"
                id="metadata-layer-button"
                className={`relative p-2 rounded-md border shadow-sm transition-all ${activeLayer === "metadata" ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50 cursor-pointer"}`}
                onClick={() => setActiveLayer("metadata")}
              >
                <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                  {activeLayer === "metadata" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-sm p-1 mr-2">
                      <Tag className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium font-sans">Metadata</h5>
                      <p className="text-xs text-gray-500 font-sans font-normal">Tagging & organization</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-sans font-normal">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div
                data-layer="logic"
                data-personality="logic_layer"
                className={`relative p-2 rounded-md border shadow-sm transition-all ${activeLayer === "logic" ? "bg-purple-50 border-purple-200" : "bg-white hover:bg-gray-50 cursor-pointer"}`}
                onClick={() => setActiveLayer("logic")}
              >
                <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                  {activeLayer === "logic" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-sm p-1 mr-2">
                      <Code className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium font-sans">Logic</h5>
                      <p className="text-xs text-gray-500 font-sans font-normal">Agent personalities</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-sans font-normal">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div
                data-layer="action"
                className={`relative p-2 rounded-md border shadow-sm transition-all ${activeLayer === "action" ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50 cursor-pointer"}`}
                onClick={() => setActiveLayer("action")}
              >
                <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                  {activeLayer === "action" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-sm p-1 mr-2">
                      <Play className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium font-sans">Action</h5>
                      <p className="text-xs text-gray-500 font-sans font-normal">Inference & integrations</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-sans font-normal">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            {activeLayer === "metadata" && <MetadataLayer analysis={analysis} />}

            {activeLayer === "logic" && (
              <LogicLayer analysis={analysis} onPersonalityChange={handlePersonalityChange} />
            )}

            {activeLayer === "action" && <ActionLayer analysis={analysis} />}
          </div>
        </div>
      </div>

      {/* Reset Questionnaire Button (for testing) */}
      <div className="fixed bottom-4 left-4">
        <Button
          onClick={() => {
            localStorage.removeItem("questionnaire-completed")
            localStorage.removeItem("google-docs-questionnaire")
            localStorage.removeItem("onboarding-state")
            window.location.reload()
          }}
          variant="outline"
          size="sm"
        >
          Reset Research Flow
        </Button>
      </div>

      {/* Onboarding Controller */}
      <OnboardingController setActiveLayer={setActiveLayer} />
    </div>
  )
}

// Update the GoogleDocsClone component to handle the onboarding start after questionnaire completion
export default function GoogleDocsClone() {
  // Create a ref to store the onboarding start function
  const onboardingStartRef = useRef<(() => void) | null>(null)

  // Handle questionnaire completion and start onboarding
  const handleQuestionnaireComplete = (responses: any) => {
    console.log("Research questionnaire completed with responses:", responses)

    // Use toast directly instead of from a hook inside a function
    toast({
      title: "Thank you for your feedback!",
      description: "Your responses will help us improve document organization features.",
      duration: 5000,
    })

    // Start onboarding after a short delay
    setTimeout(() => {
      if (onboardingStartRef.current) {
        onboardingStartRef.current()
      }
    }, 1000)
  }

  return (
    <OnboardingProvider>
      <QuestionnaireProvider
        steps={questionnaireSteps}
        storageKey="google-docs-questionnaire"
        onComplete={handleQuestionnaireComplete}
        showOnlyOnce={true}
      >
        <MainPageContent onboardingStartRef={onboardingStartRef} />
      </QuestionnaireProvider>
    </OnboardingProvider>
  )
}

