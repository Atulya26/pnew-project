'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin/login')
            }
        }
        checkSession()
    }, [router])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div className="min-h-dvh bg-neutral-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-full max-w-sm"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-white text-balance">
                        Set new password
                    </h1>
                    <p className="mt-2 text-sm text-neutral-400 text-pretty">
                        Choose a strong password for your account
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">
                            New password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className={cn(
                                'w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg',
                                'text-white text-sm placeholder:text-neutral-500',
                                'focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent',
                                'transition-shadow duration-150'
                            )}
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-1.5">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className={cn(
                                'w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg',
                                'text-white text-sm placeholder:text-neutral-500',
                                'focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent',
                                'transition-shadow duration-150'
                            )}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            'w-full py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg',
                            'hover:bg-neutral-100 active:bg-neutral-200',
                            'transition-colors duration-150',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {loading ? 'Updating...' : 'Update password'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
