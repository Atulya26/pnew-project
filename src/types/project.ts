export interface Project {
    id: string
    title: string
    description: string | null
    thoughts: string | null
    category?: string
    images: string[]
    created_at: string
    updated_at: string
    display_order: number
}

export interface ProjectInsert {
    title: string
    description?: string
    thoughts?: string
    images?: string[]
    display_order?: number
}

export interface ProjectUpdate {
    title?: string
    description?: string
    thoughts?: string
    images?: string[]
    display_order?: number
}
