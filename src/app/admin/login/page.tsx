'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
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
                        Sign in
                    </h1>
                    <p className="mt-2 text-sm text-neutral-400 text-pretty">
                        Enter your credentials to access the admin panel
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className={cn(
                                'w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg',
                                'text-white text-sm placeholder:text-neutral-500',
                                'focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent',
                                'transition-shadow duration-150'
                            )}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
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
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a
                        href="/admin/reset-password"
                        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
                    >
                        Forgot your password?
                    </a>
                </div>
            </motion.div>
        </div>
    )
}
