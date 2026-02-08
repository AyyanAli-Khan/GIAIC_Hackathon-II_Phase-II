import { useTodos } from '@/lib/api/react-query-hooks'

export function StatsOverview() {
    const { data: todos = [], isLoading, isError } = useTodos()

    const total = todos.length
    const completed = todos.filter((t) => t.is_completed).length
    const active = total - completed
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

    // Show stats immediately with 0 values instead of skeleton
    // This prevents the cards from blocking the UI while todos load

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Tasks */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-zinc-500 mb-1">Total Tasks</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900">{total}</h3>
                        <span className="text-xs font-medium text-zinc-400">tasks</span>
                    </div>
                </div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-zinc-500 mb-1">Completed</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900">{completed}</h3>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {progress}%
                        </span>
                    </div>
                </div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {/* Productivity Score */}
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-zinc-500 mb-1">Productivity</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-zinc-900">
                            {total > 0 ? Math.round((completed / total) * 10) / 10 * 10 : 0}
                        </h3>
                        <span className="text-xs font-medium text-zinc-400">score</span>
                    </div>
                </div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
