export interface TodoDTO {
    id: number
    title: string
    description: string | null
    due_date: string | null
    completed: boolean
    importance: 'low' | 'mid' | 'high'
}