"use client"

import { useState, useEffect } from "react"
import { Tag, X, Plus, Edit2, Check, RefreshCw, Trash2, Info, ChevronRight, ChevronDown, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

// Update the interface to remove documentId
interface MetadataLayerProps {
  analysis: SemanticAnalysis | null
}

// Update the function signature to remove documentId
export function MetadataLayer({ analysis }: MetadataLayerProps) {
  const [autoTags, setAutoTags] = useState<
    {
      id: string
      type: string
      value: string
      confidence: number
      isEditing?: boolean
      editValue?: string
    }[]
  >([])

  const [userTags, setUserTags] = useState<
    {
      id: string
      type: string
      value: string
      isEditing?: boolean
      editValue?: string
    }[]
  >([])

  const [userNotes, setUserNotes] = useState("")
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [newTagType, setNewTagType] = useState("topic")
  const [newTagValue, setNewTagValue] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [highlightedSegment, setHighlightedSegment] = useState<string | null>(null)
  const [metadataTab, setMetadataTab] = useState<"tags" | "hierarchy">("tags")

  // Generate automatic tags from analysis
  useEffect(() => {
    if (analysis) {
      const tags = [
        // Topics as tags
        ...analysis.topics.slice(0, 5).map((topic) => ({
          id: `topic-${topic.name.toLowerCase().replace(/\s+/g, "-")}`,
          type: "topic",
          value: topic.name,
          confidence: topic.confidence,
        })),

        // Entities as tags
        ...analysis.entities.slice(0, 5).map((entity) => ({
          id: `entity-${entity.name.toLowerCase().replace(/\s+/g, "-")}`,
          type: entity.type,
          value: entity.name,
          confidence: 0.9, // Default confidence for entities
        })),

        // Document sections as tags
        ...analysis.segments
          .filter((segment) => segment.level === "section" && segment.title)
          .map((segment) => ({
            id: `section-${segment.id}`,
            type: "section",
            value: segment.title || "Untitled Section",
            confidence: 0.95, // High confidence for sections
          })),
      ]

      setAutoTags(tags)

      // Expand the first section by default
      if (analysis.segments.length > 0) {
        setExpandedSections([analysis.segments[0].id])
      }
    }
  }, [analysis])

  // Load user tags and notes from local storage (in a real app, this would come from a database)
  // Update any localStorage references to use a fixed key instead of documentId
  // For example, change:
  // localStorage.getItem(`user-tags-${documentId}`)
  // to:
  // localStorage.getItem(`user-tags-global`)

  // Find and replace all instances of documentId in localStorage operations
  useEffect(() => {
    const savedTags = localStorage.getItem(`user-tags-global`)
    const savedNotes = localStorage.getItem(`user-notes-global`)

    if (savedTags) {
      setUserTags(JSON.parse(savedTags))
    }

    if (savedNotes) {
      setUserNotes(savedNotes)
    }
  }, [])

  // Save user tags and notes to local storage when they change
  // Update the save effect
  useEffect(() => {
    if (userTags.length > 0) {
      localStorage.setItem(`user-tags-global`, JSON.stringify(userTags))
    }

    if (userNotes) {
      localStorage.setItem(`user-notes-global`, userNotes)
    }
  }, [userTags, userNotes])

  const refreshAutoTags = () => {
    setIsLoadingTags(true)

    // Simulate API call to refresh tags
    setTimeout(() => {
      // Add a few new tags to demonstrate the refresh
      const newTags = [
        ...autoTags,
        {
          id: `topic-${Date.now()}`,
          type: "topic",
          value: "New Insight",
          confidence: 0.82,
        },
        {
          id: `entity-${Date.now() + 1}`,
          type: "organization",
          value: "Google Cloud",
          confidence: 0.88,
        },
      ]

      setAutoTags(newTags)
      setIsLoadingTags(false)
    }, 1500)
  }

  const addUserTag = () => {
    if (!newTagValue.trim()) return

    const newTag = {
      id: `user-${Date.now()}`,
      type: newTagType,
      value: newTagValue,
    }

    setUserTags([...userTags, newTag])
    setNewTagValue("")
    setIsAddingTag(false)
  }

  const removeAutoTag = (tagId: string) => {
    setAutoTags(autoTags.filter((tag) => tag.id !== tagId))
  }

  const removeUserTag = (tagId: string) => {
    setUserTags(userTags.filter((tag) => tag.id !== tagId))
  }

  const startEditingTag = (tagId: string, isUserTag: boolean) => {
    if (isUserTag) {
      setUserTags(userTags.map((tag) => (tag.id === tagId ? { ...tag, isEditing: true, editValue: tag.value } : tag)))
    } else {
      setAutoTags(autoTags.map((tag) => (tag.id === tagId ? { ...tag, isEditing: true, editValue: tag.value } : tag)))
    }
  }

  const saveTagEdit = (tagId: string, isUserTag: boolean) => {
    if (isUserTag) {
      setUserTags(
        userTags.map((tag) =>
          tag.id === tagId && tag.editValue
            ? { ...tag, value: tag.editValue, isEditing: false }
            : { ...tag, isEditing: false },
        ),
      )
    } else {
      setAutoTags(
        autoTags.map((tag) =>
          tag.id === tagId && tag.editValue
            ? { ...tag, value: tag.editValue, isEditing: false }
            : { ...tag, isEditing: false },
        ),
      )
    }
  }

  const updateTagEdit = (tagId: string, value: string, isUserTag: boolean) => {
    if (isUserTag) {
      setUserTags(userTags.map((tag) => (tag.id === tagId ? { ...tag, editValue: value } : tag)))
    } else {
      setAutoTags(autoTags.map((tag) => (tag.id === tagId ? { ...tag, editValue: value } : tag)))
    }
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const getTagColor = (type: string) => {
    switch (type) {
      case "topic":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "person":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "organization":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "location":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "date":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
      case "concept":
        return "bg-rose-100 text-rose-800 hover:bg-rose-200"
      case "section":
        return "bg-teal-100 text-teal-800 hover:bg-teal-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Render hierarchical document structure
  const renderDocumentHierarchy = () => {
    if (!analysis) return null

    const renderSegment = (segment: any, level = 0) => {
      const hasChildren = segment.children && segment.children.length > 0
      const isExpanded = expandedSections.includes(segment.id)
      const isHighlighted = highlightedSegment === segment.id

      // Find child segments
      const childSegments = analysis.segments.filter((s) => s.parent === segment.id)

      return (
        <div key={segment.id} className="mb-1">
          <div
            className={`flex items-center py-1 px-2 rounded-md ${isHighlighted ? "bg-blue-50" : "hover:bg-gray-50"} cursor-pointer`}
            onClick={() => setHighlightedSegment(isHighlighted ? null : segment.id)}
          >
            {hasChildren || childSegments.length > 0 ? (
              <button
                className="mr-1 p-0.5 rounded-sm hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSectionExpansion(segment.id)
                }}
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <div className="w-5"></div>
            )}

            <div className="flex-1 flex items-center">
              <span className={`text-sm ${segment.level === "section" ? "font-medium" : ""}`}>
                {segment.title || segment.content.substring(0, 30) + (segment.content.length > 30 ? "..." : "")}
              </span>

              <div className="ml-auto flex items-center gap-1">
                <Badge className={`${getTagColor(segment.level)} text-xs font-normal px-1.5 py-0.5 h-5`}>
                  {segment.level}
                </Badge>

                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
                  <Move className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="ml-5 pl-2 border-l border-gray-200">
              {/* Render direct child segments */}
              {childSegments.map((childSegment) => renderSegment(childSegment, level + 1))}

              {/* Render children defined in the segment */}
              {segment.children &&
                segment.children.map((childId: string) => {
                  const childSegment = analysis.segments.find((s) => s.id === childId)
                  return childSegment ? renderSegment(childSegment, level + 1) : null
                })}
            </div>
          )}
        </div>
      )
    }

    // Get top-level segments (no parent or parent is undefined)
    const topLevelSegments = analysis.segments.filter((segment) => !segment.parent)

    return (
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Document Structure</h3>
          <Button variant="outline" size="sm" className="h-7">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Section
          </Button>
        </div>

        <div className="space-y-1">{topLevelSegments.map((segment) => renderSegment(segment))}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs
        defaultValue={metadataTab}
        value={metadataTab}
        onValueChange={(value) => setMetadataTab(value as "tags" | "hierarchy")}
        className="flex flex-col h-full"
      >
        <TabsList className="shrink-0 h-8 px-1 bg-transparent border-b rounded-none w-full justify-start gap-4">
          <TabsTrigger
            value="tags"
            className="text-xs font-sans font-normal h-8 px-3 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
          >
            Tags
          </TabsTrigger>
          <TabsTrigger
            value="hierarchy"
            className="text-xs font-sans font-normal h-8 px-3 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent"
          >
            Hierarchy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="flex-1 overflow-auto p-3 space-y-3 mt-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-sans font-normal text-[#5f6368]">Automatically Detected Tags</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAutoTags}
                    disabled={isLoadingTags}
                    className="h-7 text-xs font-sans font-normal px-2 border-gray-300 bg-white hover:bg-gray-50 text-[#1a73e8] hover:text-[#174ea6]"
                  >
                    {isLoadingTags ? (
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-sans font-normal">
                  <p>Analyze document again for new tags</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="border border-gray-200 rounded-sm p-2.5 bg-white">
            {autoTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {autoTags.map((tag) => (
                  <div key={tag.id} className="relative group">
                    {tag.isEditing ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={tag.editValue}
                          onChange={(e) => updateTagEdit(tag.id, e.target.value, false)}
                          className="h-6 text-xs border rounded px-2 py-1 w-32 font-sans font-normal"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveTagEdit(tag.id, false)}
                          className="h-6 w-6 p-0 ml-1"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        className={`${getTagColor(tag.type)} text-xs font-normal px-1.5 py-0.5 h-5 font-sans`}
                        variant="outline"
                      >
                        <span className="opacity-70 mr-1">{tag.type}:</span>
                        {tag.value}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="ml-1 opacity-60">
                                <Info className="h-3 w-3 inline" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-sans font-normal">
                              <p>Confidence: {Math.round(tag.confidence * 100)}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="hidden group-hover:flex absolute -top-1 -right-1 gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingTag(tag.id, false)}
                            className="h-5 w-5 p-0 bg-white rounded-full shadow-sm"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAutoTag(tag.id)}
                            className="h-5 w-5 p-0 bg-white rounded-full shadow-sm"
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4 font-sans font-normal">
                No automatic tags detected. Try refreshing.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-xs font-sans font-normal text-[#5f6368]">User-Added Tags</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingTag(!isAddingTag)}
              className="h-7 text-xs font-sans font-normal px-2 border-gray-300 bg-white hover:bg-gray-50 text-[#1a73e8] hover:text-[#174ea6]"
              data-add-tag="true"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          </div>

          {isAddingTag && (
            <div className="border border-gray-200 rounded-sm p-2 bg-gray-50 mt-2">
              <div className="flex gap-2">
                <select
                  value={newTagType}
                  onChange={(e) => setNewTagType(e.target.value)}
                  className="text-xs border border-gray-300 rounded-sm px-2 py-1 h-7 bg-white"
                >
                  <option value="topic">Topic</option>
                  <option value="person">Person</option>
                  <option value="organization">Organization</option>
                  <option value="location">Location</option>
                  <option value="date">Date</option>
                  <option value="concept">Concept</option>
                  <option value="section">Section</option>
                  <option value="custom">Custom</option>
                </select>
                <input
                  type="text"
                  placeholder="Tag value"
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  className="text-xs border border-gray-300 rounded-sm px-2 py-1 h-7 flex-1 bg-white"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={addUserTag}
                  disabled={!newTagValue.trim()}
                  className="h-7 text-xs bg-[#1a73e8] hover:bg-[#174ea6] text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-sm p-3 mt-3 bg-white">
            {userTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userTags.map((tag) => (
                  <div key={tag.id} className="relative group">
                    {tag.isEditing ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={tag.editValue}
                          onChange={(e) => updateTagEdit(tag.id, e.target.value, true)}
                          className="h-6 text-xs border rounded px-2 py-1 w-32"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveTagEdit(tag.id, true)}
                          className="h-6 w-6 p-0 ml-1"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge className={`${getTagColor(tag.type)} text-xs font-normal px-2 py-1 h-6`} variant="outline">
                        <span className="opacity-70 mr-1">{tag.type}:</span>
                        {tag.value}
                        <div className="hidden group-hover:flex absolute -top-1 -right-1 gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingTag(tag.id, true)}
                            className="h-5 w-5 p-0 bg-white rounded-full shadow-sm"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUserTag(tag.id)}
                            className="h-5 w-5 p-0 bg-white rounded-full shadow-sm"
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No user tags added yet. Click "Add Tag" to create one.
              </div>
            )}
          </div>

          <Collapsible className="border border-gray-200 rounded-sm mt-3">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-2 text-sm font-sans font-normal text-[#5f6368] hover:bg-gray-50">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-[#5f6368]" />
                User Notes
              </div>
              <div className="text-xs text-[#5f6368]">{userNotes ? "Notes added" : "No notes yet"}</div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0 border-t border-gray-200">
              <Textarea
                placeholder="Add your personal notes about this document here..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="min-h-[100px] text-sm border border-gray-300 rounded-sm focus:border-[#1a73e8] focus:ring-[#1a73e8]"
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserNotes("")}
                  className="h-7 mr-2 text-xs font-sans font-normal border-gray-300 bg-white hover:bg-gray-50"
                  disabled={!userNotes}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-xs bg-[#1a73e8] hover:bg-[#174ea6] text-white"
                  onClick={() => {
                    localStorage.setItem(`user-notes-global`, userNotes)
                  }}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save Notes
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="hierarchy" className="flex-1 overflow-auto p-3 space-y-3 mt-0">
          {renderDocumentHierarchy()}

          <div className="border border-gray-200 rounded-sm p-3 bg-white">
            <h3 className="text-xs font-sans font-normal text-[#5f6368] mb-3">Document Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5f6368]">Document ID:</span>
                <span className="font-mono">{/*documentId*/}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f6368]">Created:</span>
                <span>March 15, 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f6368]">Last Modified:</span>
                <span>March 23, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f6368]">File Type:</span>
                <span>PDF Document</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f6368]">Size:</span>
                <span>1.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f6368]">Owner:</span>
                <span>John Doe</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

