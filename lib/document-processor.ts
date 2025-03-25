import type { SemanticAnalysis } from "@/lib/semantic-processing"

// Update the analyzeDocument function to ensure it properly processes the document content
export async function analyzeDocument(documentId: string, content: string, title?: string): Promise<SemanticAnalysis> {
  try {
    // Ensure content is not empty
    if (!content || content.trim() === "") {
      console.warn("Empty content provided to analyzeDocument")
      content = "This document is empty."
    }

    // Limit content length to avoid API issues
    const trimmedContent = content.substring(0, 10000)

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        content: trimmedContent,
        title,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to analyze document")
    }

    const data = await response.json()

    // Log the analysis results for debugging
    console.log("Document analysis completed successfully:", {
      topicsCount: data.analysis.topics.length,
      entitiesCount: data.analysis.entities.length,
      segmentsCount: data.analysis.segments.length,
    })

    return data.analysis
  } catch (error) {
    console.error("Error analyzing document:", error)
    throw error
  }
}

export function extractPlainText(htmlContent: string): string {
  // Create a temporary DOM element
  if (typeof document !== "undefined") {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = htmlContent
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  // Simple fallback for server-side
  return htmlContent
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function getDocumentSummary(content: string, maxLength = 200): string {
  const plainText = extractPlainText(content)
  if (plainText.length <= maxLength) {
    return plainText
  }
  return plainText.substring(0, maxLength) + "..."
}

export function getTagsFromAnalysis(analysis: SemanticAnalysis): string[] {
  const tags: string[] = []

  // Add topics as tags
  analysis.topics.forEach((topic) => {
    if (topic.confidence > 0.6) {
      tags.push(topic.name)
    }
  })

  // Add key entities as tags
  analysis.entities.forEach((entity) => {
    if (entity.confidence > 0.7) {
      tags.push(entity.name)
    }
  })

  // Remove duplicates and return
  return [...new Set(tags)]
}

export function getDocumentStructure(analysis: SemanticAnalysis) {
  // Get top-level sections
  const topLevelSections = analysis.segments.filter(
    (segment) => segment.level === "section" && (!segment.parent || segment.parent === null),
  )

  return topLevelSections
}

