import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Document type definition
export interface Document {
  id: string
  title: string
  content: string
  created_at?: string
  updated_at?: string
  user_id?: string
  analysis?: any
}

// Document service functions
export async function createDocument(title = "Untitled Document", userId?: string): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          title,
          content: "",
          user_id: userId || "anonymous",
        },
      ])
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error creating document:", error)
    return null
  }
}

export async function getDocument(documentId: string): Promise<Document | null> {
  try {
    const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting document:", error)
    return null
  }
}

export async function saveDocument(
  documentId: string,
  content: string,
  title?: string,
  analysis?: any,
): Promise<boolean> {
  try {
    const updates: any = {
      content,
      updated_at: new Date().toISOString(),
    }

    if (title) updates.title = title
    if (analysis) updates.analysis = analysis

    const { error } = await supabase.from("documents").update(updates).eq("id", documentId)

    if (error) {
      console.error("Supabase error saving document:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error saving document:", error)
    return false
  }
}

export async function getUserDocuments(userId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error getting user documents:", error)
    return []
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("documents").delete().eq("id", documentId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting document:", error)
    return false
  }
}

