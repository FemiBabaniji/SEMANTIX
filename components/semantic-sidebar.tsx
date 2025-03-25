"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tag, Code, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetadataLayer } from "@/components/metadata-layer"
import { LogicLayer } from "@/components/logic-layer"
import { ActionLayer } from "@/components/action-layer"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

interface SemanticSidebarProps {
  analysis: SemanticAnalysis | null
  className?: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  defaultOpen?: boolean
}

export function SemanticSidebar({
  analysis,
  className,
  defaultWidth = 320,
  minWidth = 300,
  maxWidth = 600,
  defaultOpen = true,
}: SemanticSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [activeLayer, setActiveLayer] = useState<"metadata" | "logic" | "action">("metadata")
  const [isDragging, setIsDragging] = useState(false)
  const [activePersonality, setActivePersonality] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sidebarRef.current) return

      const sidebarRect = sidebarRef.current.getBoundingClientRect()
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - sidebarRect.left))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth])

  // Handle personality change
  const handlePersonalityChange = (personalityId: string) => {
    setActivePersonality(personalityId === activePersonality ? null : personalityId)
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "relative flex flex-col border-l bg-background transition-all duration-300 ease-in-out h-full max-h-screen",
        "translate-x-0",
        className,
      )}
      style={{ width: width }}
    >
      {/* Resize handle */}
      <div
        ref={dragHandleRef}
        className="absolute -left-1 top-0 bottom-0 w-2 cursor-ew-resize"
        onMouseDown={handleMouseDown}
      />

      {/* Layer tabs */}
      <div className="flex border-b shrink-0 h-9">
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1 border-b-2 p-2 text-xs font-medium",
            activeLayer === "metadata"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveLayer("metadata")}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Metadata</span>
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1 border-b-2 p-2 text-xs font-medium",
            activeLayer === "logic"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveLayer("logic")}
        >
          <Code className="h-3.5 w-3.5" />
          <span>Logic</span>
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1 border-b-2 p-2 text-xs font-medium",
            activeLayer === "action"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveLayer("action")}
        >
          <Play className="h-3.5 w-3.5" />
          <span>Action</span>
        </button>
      </div>

      {/* Layer content */}
      <div className="flex-1 overflow-auto min-h-0">
        {activeLayer === "metadata" && <MetadataLayer analysis={analysis} />}
        {activeLayer === "logic" && <LogicLayer analysis={analysis} onPersonalityChange={handlePersonalityChange} />}
        {activeLayer === "action" && <ActionLayer analysis={analysis} />}
      </div>
    </div>
  )
}

