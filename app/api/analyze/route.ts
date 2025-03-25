import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { SemanticAnalysis } from "@/lib/semantic-processing"

const openaiModel = openai("gpt-4o", { apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { documentId, content, title } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Document content is required" }, { status: 400 })
    }

    const analysis = await analyzeDocument(documentId, content, title)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing document:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}

// Helper function to clean response text from markdown formatting
function cleanResponseText(text: string): string {
  // Remove markdown code block syntax (```json and ```)
  let cleaned = text.replace(/```json\s*|\s*```/g, "").trim()

  // If the text still doesn't look like valid JSON, try more aggressive cleaning
  if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) {
    cleaned = cleaned.replace(/^[^[{]*/, "").replace(/[^\]}]*$/, "")
  }

  console.log("Cleaned response text:", cleaned.substring(0, 100) + "...")
  return cleaned
}

async function analyzeDocument(documentId: string, content: string, title?: string): Promise<SemanticAnalysis> {
  console.log(`Analyzing document: ${documentId}, title: ${title || "Untitled"}, content length: ${content.length}`)

  const topicsResult = await generateText({
    model: openaiModel,
    prompt: `
      Analyze the following document and extract the top 5-8 main topics or themes.
      For each topic, provide a confidence score between 0 and 1.
      Format the response as a JSON array of objects with "name" and "confidence" properties.
      Return ONLY the JSON array without any markdown formatting or explanation.
      
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
      Return ONLY the JSON array without any markdown formatting or explanation.
      
      Document Title: ${title || "Untitled"}
      Document Content: ${content.substring(0, 8000)}
    `,
    temperature: 0.2,
  })

  const structureResult = await generateText({
    model: openaiModel,
    prompt: `
      Analyze the following document and create a hierarchical structure of its content.
      Identify sections, subsections, and their relationships.
      For each segment, provide:
      - id: a unique identifier (e.g., "section-1", "subsection-1-1")
      - title: the heading or title of the segment
      - content: a brief summary of the segment's content
      - level: "section", "subsection", or "paragraph"
      - parent: the id of the parent segment (null for top-level segments)
      - children: an array of ids of child segments
      
      Format the response as a JSON array of these segment objects.
      Return ONLY the JSON array without any markdown formatting or explanation.
      
      Document Title: ${title || "Untitled"}
      Document Content: ${content.substring(0, 8000)}
    `,
    temperature: 0.2,
  })

  let topics = []
  let entities = []
  let segments = []

  try {
    // Clean and parse topics
    const cleanedTopicsText = cleanResponseText(topicsResult.text)
    topics = JSON.parse(cleanedTopicsText)
    console.log(`Successfully parsed ${topics.length} topics`)
  } catch (e) {
    console.error("Error parsing topics:", e)
    console.error("Raw topics text:", topicsResult.text.substring(0, 200))
    topics = []
  }

  try {
    // Clean and parse entities
    const cleanedEntitiesText = cleanResponseText(entitiesResult.text)
    entities = JSON.parse(cleanedEntitiesText)
    console.log(`Successfully parsed ${entities.length} entities`)
  } catch (e) {
    console.error("Error parsing entities:", e)
    console.error("Raw entities text:", entitiesResult.text.substring(0, 200))
    entities = []
  }

  try {
    // Clean and parse segments
    const cleanedSegmentsText = cleanResponseText(structureResult.text)
    segments = JSON.parse(cleanedSegmentsText)
    console.log(`Successfully parsed ${segments.length} segments`)
  } catch (e) {
    console.error("Error parsing segments:", e)
    console.error("Raw segments text:", structureResult.text.substring(0, 200))
    segments = []
  }

  // Return the analysis results
  return {
    topics,
    entities,
    segments,
  }
}

