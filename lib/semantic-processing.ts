export interface SemanticAnalysis {
  topics: Array<{
    name: string
    confidence: number
  }>
  entities: Array<{
    name: string
    type: string
    confidence: number
  }>
  segments: Array<{
    id: string
    title: string
    content: string
    level: string
    parent: string | null
    children: string[]
  }>
}

