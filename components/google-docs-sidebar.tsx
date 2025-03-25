"use client"

import { useState } from "react"
import { X, HelpCircle, Settings, Info, Tag, Code, Play, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MetadataLayer } from "@/components/metadata-layer"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

interface GoogleDocsSidebarProps {
  documentId: string
  analysis: SemanticAnalysis | null
  onClose: () => void
}

export function GoogleDocsSidebar({ documentId, analysis, onClose }: GoogleDocsSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("metadata")
  const [expandedSections, setExpandedSections] = useState<string[]>(["section-1"])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  return (
    <div className="w-[280px] h-full border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">Document analysis</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <Settings className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onClose}>
            <X className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Sidebar tabs */}
      <Tabs
        defaultValue="metadata"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full justify-start px-2 pt-1 bg-transparent border-b border-gray-200 rounded-none h-auto gap-3 shrink-0">
          <TabsTrigger
            value="metadata"
            className={cn(
              "px-1 py-1.5 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent",
              activeTab === "metadata" ? "border-blue-600 text-blue-600" : "border-transparent",
            )}
          >
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            Metadata
          </TabsTrigger>
          <TabsTrigger
            value="logic"
            className={cn(
              "px-1 py-1.5 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent",
              activeTab === "logic" ? "border-blue-600 text-blue-600" : "border-transparent",
            )}
          >
            <Code className="h-3.5 w-3.5 mr-1.5" />
            Logic
          </TabsTrigger>
          <TabsTrigger
            value="action"
            className={cn(
              "px-1 py-1.5 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent",
              activeTab === "action" ? "border-blue-600 text-blue-600" : "border-transparent",
            )}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Action
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="metadata"
          className="flex-1 overflow-auto mt-0 data-[state=active]:flex data-[state=active]:flex-col"
        >
          <MetadataLayer documentId={documentId} analysis={analysis} />
        </TabsContent>

        <TabsContent value="logic" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-4">
            <div className="bg-white rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Agent Personalities</h3>
              <div className="space-y-2">
                <div className="border rounded-lg p-3 cursor-pointer hover:border-blue-200 hover:bg-blue-50">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Professor</h4>
                      <p className="text-xs text-gray-500">Academic perspective focusing on educational content</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-3 cursor-pointer hover:border-blue-200">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Settings className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Technical Expert</h4>
                      <p className="text-xs text-gray-500">Technical perspective focusing on implementation details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="action" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-4">
            <div className="bg-white rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Available Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9">
                  <Tag className="h-4 w-4 mr-2" />
                  Extract Key Topics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9">
                  <Code className="h-4 w-4 mr-2" />
                  Run Custom Analysis
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Results</h3>
              <div className="text-center py-6 text-gray-500">
                <Info className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No recent analysis results</p>
                <p className="text-xs mt-1">Run an action to see results here</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

