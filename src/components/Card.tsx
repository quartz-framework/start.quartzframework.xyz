'use client'

export function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:bg-slate-900 dark:border-slate-700 p-4">
            {children}
        </div>
    )
}