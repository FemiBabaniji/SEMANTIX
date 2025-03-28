import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

const openaiModel = openai("gpt-4o", { apiKey: process.env.OPENAI_API_KEY })

interface PersonalitySuggestion {
  name: string
  description: string
  focus: string[]
  tone: "academic" | "business" | "technical" | "casual"
  expertise: string[]
}

export async function POST(request: Request) {
  try {
    const { documentId, content, title, analysis } = await request.json()

    if (!content && !analysis) {
      return NextResponse.json({ error: "Document content or analysis is required" }, { status: 400 })
    }

    const documentAnalysis = analysis || (await analyzeDocument(content, title))
    const suggestions = await suggestPersonalities(documentAnalysis, content)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error suggesting personalities:", error)
    return NextResponse.json({ error: "Failed to suggest personalities" }, { status: 500 })
  }
}

async function analyzeDocument(content: string, title?: string): Promise<SemanticAnalysis> {
  const topicsResult = await generateText({
    model: openaiModel,
    prompt: `
      Analyze the following document and extract the top 5-8 main topics or themes.
      For each topic, provide a confidence score between 0 and 1.
      Format the response as a JSON array of objects with "name" and "confidence" properties.
      
      Document Title: ${title || "Untitled"}
      Document Content: ${content.substring(0, 8000)}
    `,
    temperature: 0.2,
  })

  const entitiesResult = await generateText({
    model: openaiModel,
    prompt: `
      Analyze the following document and extract key entities such as people, organizations, 
      locations, dates, and important concepts.
      For each entity, provide its type and a confidence score between 0 and 1.
      Format the response as a JSON array of objects with "name", "type", and "confidence" properties.
      Limit to 10-15 most important entities.
      
      Document Title: ${title || "Untitled"}
      Document Content: ${content.substring(0, 8000)}
    `,
    temperature: 0.2,
  })

  let topics = []
  let entities = []

  try {
    topics = JSON.parse(topicsResult.text)
  } catch (e) {
    console.error("Error parsing topics:", e)
  }

  try {
    entities = JSON.parse(entitiesResult.text)
  } catch (e) {
    console.error("Error parsing entities:", e)
  }

  return {
    topics,
    entities,
    segments: [],
  }
}

async function suggestPersonalities(analysis: SemanticAnalysis, content: string): Promise<PersonalitySuggestion[]> {
  const topics = analysis.topics.map((topic) => topic.name).join(", ")
  const entities = analysis.entities.map((entity) => `${entity.name} (${entity.type})`).join(", ")

  // Add this line to define contentSample
  const contentSample = content ? content.substring(0, 4000) : "No content provided"

  const suggestionsResult = await generateText({
    model: openaiModel,
    prompt: `
    You are an expert at creating AI personalities that are HIGHLY SPECIFIC to document content.
      
    Analyze this document carefully and create 2 AI personalities that would be PERFECTLY TAILORED 
    to analyze this specific document. Each personality should directly address the main themes, 
    topics, and entities found in the document.
    
    Document Topics: ${topics}
    Document Entities: ${entities}
    
    Document Content Sample:
    ${contentSample}
    
    For each personality:
    1. Create a NAME that reflects a specific role relevant to the document's domain
    2. Write a DESCRIPTION that mentions specific themes from the document
    3. List FOCUS AREAS (3-5) that directly reference concepts, methodologies, or frameworks mentioned in the document
    4. Choose a TONE (academic, business, technical, or casual) that best matches the document's style
    5. List EXPERTISE AREAS (3-5) that would be most valuable for analyzing this specific document
    
    IMPORTANT: Each personality must be HIGHLY SPECIFIC to this document. Avoid generic personalities.
    For example, if the document is about semantic layers in Google Docs, create personalities like 
    "Document Taxonomy Specialist" or "Metadata Integration Architect" rather than generic "Technical Expert".
    
    Format the response as a JSON array without markdown code fences.
    `,
    temperature: 0.7,
  })

  const cleanText = suggestionsResult.text.replace(/```json|```/g, "").trim()

  try {
    const suggestions = JSON.parse(cleanText)

    // Add validation to ensure proper formatting
    return suggestions.map((suggestion: any) => ({
      name: suggestion.name || "Unnamed Personality",
      description: suggestion.description || "No description provided",
      focus: Array.isArray(suggestion.focus) ? suggestion.focus : [],
      tone: suggestion.tone || "academic",
      expertise: Array.isArray(suggestion.expertise) ? suggestion.expertise : [],
    }))
  } catch (e) {
    console.error("Error parsing personality suggestions:", e, "Original response:", suggestionsResult.text)
    return []
  }
}

