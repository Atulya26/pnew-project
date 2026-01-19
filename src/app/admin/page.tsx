'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Project, ProjectInsert } from '@/types/project'

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [thoughts, setThoughts] = useState('')
    const [images, setImages] = useState<string[]>([])

    const fetchProjects = useCallback(async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Error fetching projects:', error)
        } else {
            setProjects(data || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const uploadedUrls: string[] = []

        for (const file of Array.from(files)) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `projects/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('designs')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Error uploading:', uploadError)
                continue
            }

            const { data: { publicUrl } } = supabase.storage
                .from('designs')
                .getPublicUrl(filePath)

            uploadedUrls.push(publicUrl)
        }

        setImages([...images, ...uploadedUrls])
        setUploading(false)
    }

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setThoughts('')
        setImages([])
        setEditingProject(null)
    }

    const handleOpenModal = (project?: Project) => {
        if (project) {
            setEditingProject(project)
            setTitle(project.title)
            setDescription(project.description || '')
            setThoughts(project.thoughts || '')
            setImages(project.images || [])
        } else {
            resetForm()
        }
        setShowModal(true)
    }

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault()

        const projectData: ProjectInsert = {
            title,
            description,
            thoughts,
            images,
            display_order: editingProject?.display_order ?? projects.length,
        }

        if (editingProject) {
            const { error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', editingProject.id)

            if (error) {
                console.error('Error updating project:', error)
                return
            }
        } else {
            const { error } = await supabase.from('projects').insert(projectData)

            if (error) {
                console.error('Error creating project:', error)
                return
            }
        }

        setShowModal(false)
        resetForm()
        fetchProjects()
    }

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        const { error } = await supabase.from('projects').delete().eq('id', id)

        if (error) {
            console.error('Error deleting project:', error)
            return
        }

        fetchProjects()
    }

    return (
        <div className="min-h-dvh bg-neutral-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-neutral-950 border-b border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-white">Projects</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleOpenModal()}
                            className={cn(
                                'px-3 py-1.5 bg-white text-neutral-900 text-sm font-medium rounded-lg',
                                'hover:bg-neutral-100 active:bg-neutral-200',
                                'transition-colors duration-150'
                            )}
                        >
                            Add project
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 text-neutral-500 hover:text-neutral-300 text-sm transition-colors duration-150"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-8 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="size-16 mx-auto mb-4 bg-neutral-900 rounded-xl flex items-center justify-center">
                            <svg className="size-7 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-white mb-1 text-balance">No projects yet</h2>
                        <p className="text-sm text-neutral-500 mb-6 text-pretty">Add your first design project</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className={cn(
                                'px-4 py-2 bg-white text-neutral-900 text-sm font-medium rounded-lg',
                                'hover:bg-neutral-100 active:bg-neutral-200',
                                'transition-colors duration-150'
                            )}
                        >
                            Add project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors duration-150"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[4/3] bg-neutral-800 relative overflow-hidden">
                                    {project.images && project.images.length > 0 ? (
                                        <img
                                            src={project.images[0]}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="size-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {project.images && project.images.length > 1 && (
                                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-neutral-900/80 rounded text-xs text-neutral-300 tabular-nums">
                                            +{project.images.length - 1}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="text-sm font-medium text-white truncate">{project.title}</h3>
                                    {project.description && (
                                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{project.description}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleOpenModal(project)}
                                            className={cn(
                                                'flex-1 px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg',
                                                'text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white',
                                                'transition-colors duration-150'
                                            )}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className={cn(
                                                'px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg',
                                                'text-xs text-red-400 hover:bg-red-950/50 hover:border-red-900/50',
                                                'transition-colors duration-150'
                                            )}
                                            aria-label={`Delete ${project.title}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl"
                        >
                            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-white">
                                    {editingProject ? 'Edit project' : 'New project'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="size-8 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSaveProject} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className={cn(
                                            'w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg',
                                            'text-white text-sm placeholder:text-neutral-500',
                                            'focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent',
                                            'transition-shadow duration-150'
                                        )}
                                        placeholder="Project title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        className={cn(
                                            'w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg',
                                            'text-white text-sm placeholder:text-neutral-500',
                                            'focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent',
                                            'transition-shadow duration-150 resize-none'
                                        )}
                                        placeholder="Brief description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Design thoughts</label>
                                    <textarea
                                        value={thoughts}
                                        onChange={(e) => setThoughts(e.target.value)}
                                        rows={3}
                                        className={cn(
                                            'w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg',
                                            'text-white text-sm placeholder:text-neutral-500',
                                            'focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent',
                                            'transition-shadow duration-150 resize-none'
                                        )}
                                        placeholder="Your ideas and thought process..."
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Images</label>
                                    <div className="space-y-3">
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {images.map((url, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute top-1 right-1 size-5 bg-neutral-900/80 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                                            aria-label="Remove image"
                                                        >
                                                            <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <label className="block cursor-pointer">
                                            <div className={cn(
                                                'border border-dashed border-neutral-700 rounded-lg p-4 text-center',
                                                'hover:border-neutral-600 transition-colors duration-150'
                                            )}>
                                                {uploading ? (
                                                    <div className="size-6 mx-auto border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <svg className="size-6 mx-auto text-neutral-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
                                                        </svg>
                                                        <p className="text-xs text-neutral-500">Click to upload</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className={cn(
                                            'flex-1 px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg',
                                            'text-sm text-neutral-300 font-medium hover:bg-neutral-700',
                                            'transition-colors duration-150'
                                        )}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={cn(
                                            'flex-1 px-3 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg',
                                            'hover:bg-neutral-100 active:bg-neutral-200',
                                            'transition-colors duration-150'
                                        )}
                                    >
                                        {editingProject ? 'Save' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
