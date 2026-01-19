'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('atulya2612@gmail.com')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/update-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
        }
        setLoading(false)
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
                        Reset password
                    </h1>
                    <p className="mt-2 text-sm text-neutral-400 text-pretty">
                        {success
                            ? 'Check your email for the reset link'
                            : "We'll send you a link to reset your password"}
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
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
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="size-12 mx-auto mb-4 bg-neutral-900 rounded-full flex items-center justify-center">
                            <svg
                                className="size-5 text-emerald-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-neutral-400 text-pretty">
                            We&apos;ve sent a reset link to <span className="text-neutral-200">{email}</span>
                        </p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a
                        href="/admin/login"
                        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
                    >
                        ← Back to sign in
                    </a>
                </div>
            </motion.div>
        </div>
    )
}
