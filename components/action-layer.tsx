"use client"

import { useState } from "react"
import {
  FileText,
  Layers,
  Code,
  Play,
  Check,
  Calendar,
  Bell,
  Zap,
  Send,
  Download,
  ExternalLink,
  Plus,
  Database,
  Save,
  Workflow,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { analyzeDocument, extractPlainText } from "@/lib/document-processor"
import { useToast } from "@/hooks/use-toast"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

// Update the interface to remove documentId
interface ActionLayerProps {
  analysis: SemanticAnalysis | null
}

// Update the function signature to remove documentId
export function ActionLayer({ analysis }: ActionLayerProps) {
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("actions")
  const { toast } = useToast()

  // Automation rules
  const [automationRules, setAutomationRules] = useState({
    autoGenerateSummary: true,
    scheduleWeeklyAnalysis: false,
    notifyOnChanges: true,
    syncWithChatbot: false,
    exportToDatabase: false,
  })

  const handleAutomationRuleChange = (rule: keyof typeof automationRules) => {
    setAutomationRules((prev) => ({
      ...prev,
      [rule]: !prev[rule],
    }))
  }

  const runAnalysis = () => {
    setIsRunningAnalysis(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunningAnalysis(false)
          setAnalysisComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  // Update the runCustomAnalysis function to not use documentId
  const runCustomAnalysis = async () => {
    setIsRunningAnalysis(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)

    try {
      // Get the document content from the editor
      const editorElement = document.querySelector('[contenteditable="true"]')
      if (!editorElement) {
        throw new Error("Editor element not found")
      }

      const content = editorElement.innerHTML
      const plainText = extractPlainText(content)
      const title = document.querySelector("input[value]")?.getAttribute("value") || "Untitled document"

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Call the API to analyze the document
      // Use a fixed ID for the document
      const result = await analyzeDocument("global-document", plainText, title)

      // Complete the analysis
      clearInterval(progressInterval)
      setAnalysisProgress(100)
      setTimeout(() => {
        setIsRunningAnalysis(false)
        setAnalysisComplete(true)
      }, 500)

      toast({
        title: "Analysis complete",
        description: "Document has been analyzed successfully.",
      })

      // Switch to metadata tab to show results
      if (typeof window !== "undefined") {
        // Find the metadata layer button and click it
        const metadataButton = document.querySelector('[data-layer="metadata"]')
        if (metadataButton) {
          ;(metadataButton as HTMLElement).click()
        }
      }
    } catch (error) {
      console.error("Error analyzing document:", error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      })
      setIsRunningAnalysis(false)
    }
  }

  const runSimulation = () => {
    setActiveTab("results")
    runCustomAnalysis()
  }

  // Update the renderActionButtons function to ensure buttons are always visible
  const renderActionButtons = () => {
    return (
      <div className="space-y-2">
        <Button
          data-action="generate-summary"
          variant="secondary"
          size="sm"
          className="w-full justify-start font-sans font-normal h-7 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-[#202124]"
          disabled={isRunningAnalysis}
          onClick={runAnalysis}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5 text-[#5f6368]" />
          Generate Summary
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start font-sans font-normal h-7 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-[#202124]"
          disabled={isRunningAnalysis}
        >
          <Layers className="h-3.5 w-3.5 mr-1.5 text-[#5f6368]" />
          Extract Key Topics
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start font-sans font-normal h-7 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-[#202124]"
          disabled={isRunningAnalysis}
          onClick={runCustomAnalysis}
        >
          <Code className="h-3.5 w-3.5 mr-1.5 text-[#5f6368]" />
          Run Custom Analysis
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start font-sans font-normal h-7 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-[#202124]"
          disabled={isRunningAnalysis}
        >
          <Zap className="h-3.5 w-3.5 mr-1.5 text-[#5f6368]" />
          Generate Action Items
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start font-sans font-normal h-7 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-[#202124]"
          disabled={isRunningAnalysis}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#5f6368]" />
          Suggest Personalities
        </Button>

        <Button
          variant="secondary"
          className="w-full justify-start h-7 text-[10px] border border-gray-200 bg-white hover:bg-gray-50 text-[#202124]"
          asChild
        >
          <Link href="/dashboard/operate">
            <Workflow className="h-3 w-3 mr-1 text-[#5f6368]" />
            Open Operate Action Page
          </Link>
        </Button>
      </div>
    )
  }

  // Update the automation rules section
  const renderAutomationRules = () => {
    return (
      <div className="space-y-2">
        {Object.entries(automationRules).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id={key}
                checked={value}
                onCheckedChange={() => handleAutomationRuleChange(key as keyof typeof automationRules)}
                disabled={isRunningAnalysis}
                className="data-[state=checked]:bg-[#1a73e8]"
              />
              <Label htmlFor={key} className="text-xs cursor-pointer font-sans font-normal text-[#202124]">
                {key
                  .split(/(?=[A-Z])/)
                  .join(" ")
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </Label>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Update the renderIntegrationActions function to ensure buttons are always visible
  const renderIntegrationActions = () => {
    return (
      <div className="space-y-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start h-7 text-[10px]"
          disabled={isRunningAnalysis}
        >
          <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 12V19M12 19L9 16M12 19L15 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 9C19 10.1046 18.1046 11 17 11C15.8954 11 15 10.1046 15 9C15 7.89543 15.8954 7 17 7C18.1046 7 19 7.89543 19 9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9C9 10.1046 8.10457 11 7 11C5.89543 11 5 10.1046 5 9C5 7.89543 5.89543 7 7 7C8.10457 7 9 7.89543 9 9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 9C12 10.1046 11.1046 11 10 11C8.89543 11 8 10.1046 8 9C8 7.89543 8.89543 7 10 7C11.1046 7 12 7.89543 12 9Z"
              fill="currentColor"
            />
            <path
              d="M12 9C12 10.1046 11.1046 11 10 11C8.89543 11 8 10.1046 8 9C8 7.89543 8.89543 7 10 7C11.1046 7 12 7.89543 12 9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Export to Slack
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start h-7 text-[10px]"
          disabled={isRunningAnalysis}
        >
          <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 14V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 14H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V14Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Send to Notion
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start h-7 text-[10px]"
          disabled={isRunningAnalysis}
        >
          <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add to Google Drive
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start h-7 text-[10px]"
          disabled={isRunningAnalysis}
        >
          <Send className="h-3 w-3 mr-1" />
          Connect to Chatbot
        </Button>
      </div>
    )
  }

  const renderAnalysisResults = () => {
    if (isRunningAnalysis) {
      return (
        <div className="space-y-3 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-[#202124]">Running Analysis</h3>
            <Badge variant="outline" className="font-normal text-[10px] border-0 bg-[#e8f0fe] text-[#1a73e8]">
              {analysisProgress}%
            </Badge>
          </div>

          <Progress value={analysisProgress} className="w-full h-1.5 bg-gray-100" indicatorClassName="bg-[#1a73e8]" />

          <div className="space-y-1.5">
            <div className="flex items-center">
              <Check className={`h-3 w-3 ${analysisProgress >= 20 ? "text-[#1a73e8]" : "text-gray-300"} mr-1.5`} />
              <span className="text-[10px] text-[#202124]">Initializing document analysis</span>
            </div>

            <div className="flex items-center">
              <Check className={`h-3 w-3 ${analysisProgress >= 40 ? "text-[#1a73e8]" : "text-gray-300"} mr-1.5`} />
              <span className="text-[10px] text-[#202124]">Processing semantic structure</span>
            </div>

            <div className="flex items-center">
              <Check className={`h-3 w-3 ${analysisProgress >= 60 ? "text-[#1a73e8]" : "text-gray-300"} mr-1.5`} />
              <span className="text-[10px] text-[#202124]">Extracting key insights</span>
            </div>

            <div className="flex items-center">
              <Check className={`h-3 w-3 ${analysisProgress >= 80 ? "text-[#1a73e8]" : "text-gray-300"} mr-1.5`} />
              <span className="text-[10px] text-[#202124]">Generating executive summary</span>
            </div>

            <div className="flex items-center">
              <Check className={`h-3 w-3 ${analysisProgress >= 100 ? "text-[#1a73e8]" : "text-gray-300"} mr-1.5`} />
              <span className="text-[10px] text-[#202124]">Finalizing results</span>
            </div>
          </div>
        </div>
      )
    }

    if (analysisComplete) {
      return (
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium">Analysis Complete</h3>
            <Badge variant="outline" className="font-normal text-[10px] text-green-600 bg-green-50">
              Success
            </Badge>
          </div>

          <div className="border rounded-md p-2.5">
            <h4 className="text-xs font-medium mb-1.5">Executive Summary</h4>
            <p className="text-[10px] text-gray-600 leading-tight">
              This document outlines a comprehensive semantic layer for enhanced document control in Google Drive. The
              system provides intelligent organization through automatic tagging and hierarchical categorization. Key
              features include semantic analysis, interactive visualization, and conversational agents. The solution
              addresses challenges in document retrieval and organization, improving productivity and information
              accessibility.
            </p>

            <div className="flex justify-end mt-2">
              <Button variant="outline" size="sm" className="h-6 text-[10px]">
                <Download className="h-2.5 w-2.5 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <div className="border rounded-md p-2.5">
            <h4 className="text-xs font-medium mb-1.5">Key Insights</h4>

            <div className="space-y-1.5">
              <div className="flex items-start">
                <div className="bg-blue-100 p-0.5 rounded-full mr-1.5 mt-0.5">
                  <Layers className="h-2.5 w-2.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium">Document Management Focus</p>
                  <p className="text-[9px] text-gray-600 leading-tight">
                    The document emphasizes improved document management through semantic organization.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-0.5 rounded-full mr-1.5 mt-0.5">
                  <Layers className="h-2.5 w-2.5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium">Integration Capabilities</p>
                  <p className="text-[9px] text-gray-600 leading-tight">
                    Strong focus on integration with third-party applications and external systems.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 p-0.5 rounded-full mr-1.5 mt-0.5">
                  <Layers className="h-2.5 w-2.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium">User Experience Enhancement</p>
                  <p className="text-[9px] text-gray-600 leading-tight">
                    Emphasis on improving user satisfaction through intuitive document interaction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab("actions")}
              className="h-6 text-[10px] border border-gray-200 bg-white hover:bg-gray-50 text-[#5f6368]"
            >
              Back to Actions
            </Button>

            <Button variant="default" size="sm" className="h-6 text-[10px] bg-[#1a73e8] hover:bg-[#174ea6] text-white">
              <ExternalLink className="h-2.5 w-2.5 mr-1" />
              Share Results
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="p-3 text-center text-gray-500">
        <div className="mb-2">
          <Play className="h-8 w-8 mx-auto text-gray-300" />
        </div>
        <h3 className="text-sm font-medium">No Analysis Results</h3>
        <p className="text-[10px] mt-1">
          Run an analysis action to see results here. Choose from executive summary, key topics extraction, or custom
          analysis.
        </p>
        <Button
          variant="default"
          className="mt-3 h-7 text-xs bg-[#1a73e8] hover:bg-[#174ea6] text-white"
          onClick={runSimulation}
        >
          <Play className="h-3 w-3 mr-1.5" />
          Run Simulation
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        {/* Update the tabs to match Google Docs styling */}
        <TabsList className="shrink-0 h-7 p-0.5 bg-transparent border-b rounded-none w-full justify-start gap-4">
          <TabsTrigger
            value="actions"
            className="text-[10px] uppercase tracking-wide font-sans font-normal h-6 px-2 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
          >
            Actions
          </TabsTrigger>
          <TabsTrigger
            value="automation"
            className="text-[10px] uppercase tracking-wide font-sans font-normal h-6 px-2 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
          >
            Automation
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="text-[10px] uppercase tracking-wide font-sans font-normal h-6 px-2 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
          >
            Results
          </TabsTrigger>
        </TabsList>
        <TabsContent value="actions" className="flex-1 overflow-auto p-2 space-y-2 mt-0">
          {/* Update the content containers */}
          <div className="border border-gray-200 rounded-sm p-2 bg-white">
            <h3 className="text-xs font-sans font-normal text-[#5f6368] mb-2">Available Actions</h3>
            {renderActionButtons()}
          </div>
          <div className="border border-gray-200 rounded-sm p-2 bg-white">
            <h3 className="text-xs font-sans font-normal text-[#5f6368] mb-2">Integration Actions</h3>
            {renderIntegrationActions()}
          </div>
          {/* Update the execute button */}
          <Button
            className="w-full mt-2 h-7 text-xs bg-[#1a73e8] hover:bg-[#174ea6] text-white"
            disabled={isRunningAnalysis}
            onClick={() => {
              setActiveTab("results")
              runCustomAnalysis()
            }}
          >
            <Play className="h-3 w-3 mr-1.5" />
            Execute Selected Actions
          </Button>
        </TabsContent>
        <TabsContent value="automation" className="flex-1 overflow-auto p-2 space-y-2 mt-0">
          {/* Update the automation section */}
          <div className="border border-gray-200 rounded-sm p-2 bg-white">
            <h3 className="text-xs font-sans font-normal text-[#5f6368] mb-2">Automation Rules</h3>
            {renderAutomationRules()}
          </div>
          {/* Update the scheduled tasks section */}
          <div className="border border-gray-200 rounded-sm p-2 bg-white">
            <h3 className="text-xs font-sans font-normal text-[#5f6368] mb-2">Scheduled Tasks</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between border border-gray-200 rounded-sm p-2 bg-white">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 text-[#1a73e8] mr-1.5" />
                  <div>
                    <p className="text-[10px] font-medium text-[#202124]">Weekly Analysis</p>
                    <p className="text-[9px] text-[#5f6368]">Every Monday at 9:00 AM</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${automationRules.scheduleWeeklyAnalysis ? "bg-[#e8f0fe] text-[#1a73e8]" : "bg-gray-100 text-[#5f6368]"} text-[9px] h-4 py-0 px-1 border-0`}
                >
                  {automationRules.scheduleWeeklyAnalysis ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-sm p-2 bg-white">
                <div className="flex items-center">
                  <Bell className="h-3 w-3 text-[#1a73e8] mr-1.5" />
                  <div>
                    <p className="text-[10px] font-medium text-[#202124]">Change Notifications</p>
                    <p className="text-[9px] text-[#5f6368]">When significant changes detected</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${automationRules.notifyOnChanges ? "bg-[#e8f0fe] text-[#1a73e8]" : "bg-gray-100 text-[#5f6368]"} text-[9px] h-4 py-0 px-1 border-0`}
                >
                  {automationRules.notifyOnChanges ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-1 h-6 text-[10px] border border-gray-200 bg-white hover:bg-gray-50 text-[#1a73e8]"
              >
                <Plus className="h-2.5 w-2.5 mr-1" />
                Add Scheduled Task
              </Button>
            </div>
          </div>
          <div className="border rounded-md p-2">
            <h3 className="text-xs font-medium mb-2 font-sans">Webhook Integrations</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between border rounded-md p-2">
                <div className="flex items-center">
                  <Send className="h-3 w-3 text-purple-500 mr-1.5" />
                  <div>
                    <p className="text-[10px] font-medium">Chatbot Sync</p>
                    <p className="text-[9px] text-gray-500">https://api.example.com/chatbot/sync</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${automationRules.syncWithChatbot ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"} text-[9px] h-4 py-0 px-1`}
                >
                  {automationRules.syncWithChatbot ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border rounded-md p-2">
                <div className="flex items-center">
                  <Database className="h-3 w-3 text-blue-500 mr-1.5" />
                  <div>
                    <p className="text-[10px] font-medium">Database Export</p>
                    <p className="text-[9px] text-gray-500">https://api.example.com/db/export</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${automationRules.exportToDatabase ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"} text-[9px] h-4 py-0 px-1`}
                >
                  {automationRules.exportToDatabase ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Button variant="secondary" size="sm" className="w-full mt-1 h-6 text-[10px]">
                <Plus className="h-2.5 w-2.5 mr-1" />
                Add Webhook
              </Button>
            </div>
          </div>
          {/* Update the save automation settings button */}
          <Button className="w-full h-7 text-xs bg-[#1a73e8] hover:bg-[#174ea6] text-white">
            <Save className="h-3 w-3 mr-1.5" />
            Save Automation Settings
          </Button>
        </TabsContent>
        <TabsContent value="results" className="flex-1 overflow-auto p-2 mt-0">
          {/* Update the results section */}
          {renderAnalysisResults()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

