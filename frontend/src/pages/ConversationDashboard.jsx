import { useState } from 'react';
import { Bot, Wifi, WifiOff, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import StatsCards from '../components/StatsCards';
import ConversationTable from '../components/ConversationTable';
import ConversationDrawer from '../components/ConversationDrawer';
import DailySummaryCard from '../components/DailySummaryCard';
import { useConversations } from '../hooks/useConversations';

export default function ConversationDashboard({ onLogout }) {
    const [selectedConversation, setSelectedConversation] = useState(null);

    const {
        conversations, stats,
        loading, error, usingMock, refetch,
        search, setSearch,
        urgencyFilter, setUrgencyFilter,
        statusFilter, setStatusFilter,
        dateFilter, setDateFilter,
        sortOrder, setSortOrder,
        markAsResolved,
        markAsViewed,
    } = useConversations();

    const today = format(new Date(), 'EEEE, dd MMMM yyyy');
    const isLive = !usingMock && !error;

    const handleView = (conv) => {
        setSelectedConversation(conv);
        // Mark as viewed if it was unattended
        if (conv.status === 'unattended') {
            markAsViewed(conv.id);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Top Nav */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-brand-600 flex items-center justify-center shadow-md">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                                Looks Salon
                            </h1>
                            <p className="text-xs text-gray-500 font-medium leading-none mt-0.5">
                                AI Receptionist Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {/* API status pill */}
                        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${isLive
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}>
                            {isLive
                                ? <><Wifi className="w-3.5 h-3.5" />Live</>
                                : <><WifiOff className="w-3.5 h-3.5" />Demo Mode</>
                            }
                        </div>

                        <div className="hidden sm:block text-xs text-gray-500 font-medium">{today}</div>

                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="btn-ghost border border-gray-200 text-xs disabled:opacity-50"
                            title="Refresh data from API"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            onClick={onLogout}
                            className="px-3 py-1.5 rounded-lg bg-gray-100/80 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-transparent hover:border-red-100 text-xs font-bold transition-all duration-200"
                            title="Sign out"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* API Error Banner */}
            {error && (
                <div className="max-w-screen-xl mx-auto px-6 pt-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                        <div>
                            <span className="font-semibold">API server offline</span>
                            <span className="text-amber-700"> – showing demo data. Start the server: </span>
                            <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">node start-dashboard.js</code>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-screen-xl mx-auto px-6 py-7 space-y-6">
                {/* Page Title */}
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        Conversation Dashboard
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Customer inquiries handled by the AI receptionist · Sorted by most recent contact
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        Loading conversations...
                    </div>
                )}

                {/* KPI Cards */}
                <StatsCards stats={stats} />

                {/* Main Grid: Table + Sidebar */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
                    {/* Conversation Table */}
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-bold text-gray-800">Active Conversations</h3>
                            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-accent text-xs font-semibold border border-brand-100">
                                {conversations.length}
                            </span>
                            {usingMock && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-200">
                                    Demo Data
                                </span>
                            )}
                            {stats.unattended > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200">
                                    {stats.unattended} unattended
                                </span>
                            )}
                        </div>
                        <ConversationTable
                            conversations={conversations}
                            search={search} setSearch={setSearch}
                            urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter}
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            dateFilter={dateFilter} setDateFilter={setDateFilter}
                            sortOrder={sortOrder} setSortOrder={setSortOrder}
                            onView={handleView}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <DailySummaryCard conversations={conversations} />

                        {/* Quick Tips Card */}
                        <div className="card p-5">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Quick Guide</h4>
                            <ul className="space-y-2.5 text-xs text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                                    <span><strong className="text-gray-800">Unattended</strong> – new contact, not yet reviewed</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                    <span><strong className="text-gray-800">Active</strong> – reviewed, being followed up</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                                    <span><strong className="text-gray-800">High urgency</strong> – call back immediately</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-3 h-3 text-accent flex-shrink-0 mt-0.5">→</span>
                                    <span>Click any row to see conversation history</span>
                                </li>
                            </ul>
                        </div>

                        {/* API Connection Info */}
                        <div className="card p-5">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">API Status</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                    <span className="text-gray-600">
                                        {isLive ? 'Connected to live server' : 'Server offline – demo mode'}
                                    </span>
                                </div>
                                <div className="text-gray-400 pl-4 font-mono text-[10px] leading-relaxed">
                                    POST /api/n8n<br />
                                    GET  /api/conversations<br />
                                    PATCH /api/conversations/:id/resolve<br />
                                    Port: 3001
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Drawer */}
            <ConversationDrawer
                conversation={selectedConversation}
                onClose={() => setSelectedConversation(null)}
                onResolve={markAsResolved}
            />
        </div>
    );
}
