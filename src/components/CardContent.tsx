'use client'

export function CardContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4 p-2 sm:p-4">
            {children}
        </div>
    )
}