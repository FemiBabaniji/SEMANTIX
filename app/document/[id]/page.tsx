"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { MetadataLayer } from "@/components/metadata-layer"
import { LogicLayer } from "@/components/logic-layer"
import { ActionLayer } from "@/components/action-layer"
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider"
import { OnboardingController } from "@/components/onboarding/onboarding-controller"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { analyzeDocument, extractPlainText } from "@/lib/document-processor"
import { useToast } from "@/hooks/use-toast"
import type { SemanticAnalysis } from "@/lib/semantic-processing"
import GoogleStyledLogo from "@/components/google-styled-logo"

// Mock data for initial render
const initialAnalysis: SemanticAnalysis = {
  topics: [],
  entities: [],
  segments: [],
}

function DocumentPageContent() {
  const params = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<SemanticAnalysis>(initialAnalysis)
  const [documentTitle, setDocumentTitle] = useState("Prototype for Research")
  const [isSaved, setIsSaved] = useState(true)
  const [activeLayer, setActiveLayer] = useState<"metadata" | "logic" | "action">("metadata")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { startOnboarding } = useOnboarding()
  const { toast } = useToast()

  // Redirect to main page to avoid document ID in URL
  useEffect(() => {
    router.push("/")
  }, [router])

  // Force start onboarding when the page loads
  useEffect(() => {
    console.log("DocumentPageContent mounted")
  }, [])

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

  // Update the runDocumentAnalysis function in app/document/[id]/page.tsx to properly analyze the current document and update the metadata section
  const runDocumentAnalysis = async () => {
    if (!editorRef.current) return

    try {
      setIsAnalyzing(true)
      toast({
        title: "Analysis started",
        description: "Analyzing document content...",
      })

      const content = editorRef.current.innerHTML
      const plainText = extractPlainText(content)

      // Call the API to analyze the document with a fixed ID
      const result = await analyzeDocument("global-document", plainText, documentTitle)

      setAnalysis(result)

      // Set active layer to metadata to show the results
      setActiveLayer("metadata")

      toast({
        title: "Analysis complete",
        description: "Document has been analyzed successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error analyzing document:", error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const collaborators = [
    { name: "Alex Kim", image: "/placeholder.svg?height=32&width=32" },
    { name: "Jamie Smith", image: "/placeholder.svg?height=32&width=32" },
    { name: "Taylor Wong", image: "/placeholder.svg?height=32&width=32" },
  ]

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
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="font-sans font-normal">
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
          <Button
            variant="outline"
            size="sm"
            className="mr-2 font-sans font-normal"
            onClick={runDocumentAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Analyze Document
              </>
            )}
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

              <h2>Feature Suggestions</h2>
              <p>
                We value your feedback! Please document any additional features you believe would enhance your
                experience with Semantix below:
              </p>
              <ol>
                <li>[Your suggestion here]</li>
                <li>[Your suggestion here]</li>
                <li>[Your suggestion here]</li>
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

      {/* Onboarding Controller */}
      <OnboardingController setActiveLayer={setActiveLayer} />
    </div>
  )
}

export default function DocumentPage() {
  return (
    <OnboardingProvider>
      <DocumentPageContent />
    </OnboardingProvider>
  )
}

