'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all"
                        >
                            + Add Project
                        </motion.button>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                    </div>
                ) : projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">No projects yet</h2>
                        <p className="text-white/60 mb-6">Start showcasing your amazing designs!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOpenModal()}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl shadow-lg"
                        >
                            Create Your First Project
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                                >
                                    {/* Project Thumbnail */}
                                    <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                                        {project.images && project.images.length > 0 ? (
                                            <img
                                                src={project.images[0]}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Image count badge */}
                                        {project.images && project.images.length > 1 && (
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                                                +{project.images.length - 1} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Info */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                                        {project.description && (
                                            <p className="text-white/60 text-sm line-clamp-2">{project.description}</p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleOpenModal(project)}
                                                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-slate-900/95 rounded-2xl border border-white/20 shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingProject ? 'Edit Project' : 'Add New Project'}
                                </h2>
                            </div>

                            <form onSubmit={handleSaveProject} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Project title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Brief description of the project"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Design Thoughts</label>
                                    <textarea
                                        value={thoughts}
                                        onChange={(e) => setThoughts(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Share your design ideas and thought process..."
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Images</label>
                                    <div className="space-y-4">
                                        {/* Uploaded Images Grid */}
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {images.map((url, index) => (
                                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <label className="block cursor-pointer">
                                            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
                                                {uploading ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
                                                ) : (
                                                    <>
                                                        <svg className="w-10 h-10 mx-auto text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <p className="text-white/60 text-sm">Click to upload images</p>
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
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl shadow-lg"
                                    >
                                        {editingProject ? 'Save Changes' : 'Create Project'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
