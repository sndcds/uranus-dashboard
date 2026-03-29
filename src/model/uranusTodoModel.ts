export interface UranusTodoDTO {
    id: number
    title: string
    description: string | null
    due_date: string | null
    completed: boolean
    importance: 'low' | 'medium' | 'high'
}