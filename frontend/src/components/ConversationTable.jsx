import { Search, Filter, ArrowUpDown, Eye, Phone, Calendar, ChevronUp, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { getUrgencyConfig } from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';

function UrgencyBadge({ text }) {
    const config = getUrgencyConfig(text);
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border`}
            style={{ color: config.color, backgroundColor: config.bg, borderColor: config.border }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
            {text}
        </span>
    );
}

function StatusBadge({ status }) {
    if (status === 'unattended') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                <Clock className="w-2.5 h-2.5" />
                Unattended
            </span>
        );
    }
    if (status === 'active') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Active
            </span>
        );
    }
    return null;
}

export default function ConversationTable({
    conversations,
    search, setSearch,
    urgencyFilter, setUrgencyFilter,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    sortOrder, setSortOrder,
    onView,
}) {
    return (
        <div className="card overflow-hidden">
            {/* Filters Bar */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-field pl-9"
                        />
                    </div>

                    {/* Urgency Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                            value={urgencyFilter}
                            onChange={e => setUrgencyFilter(e.target.value)}
                            className="input-field pl-9 pr-8 appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Urgencies</option>
                            <option value="high">🔴 High</option>
                            <option value="medium">🟠 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="input-field pr-8 appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="unattended">🔔 Unattended</option>
                            <option value="active">✅ Active</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="input-field pl-9 cursor-pointer min-w-[160px]"
                        />
                    </div>

                    {/* Sort */}
                    <button
                        onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
                        className="btn-ghost border border-gray-200"
                        title="Sort by urgency"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        Urgency {sortOrder === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>

                    {/* Result count */}
                    <span className="ml-auto text-xs text-gray-500 font-medium">
                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Phone className="w-10 h-10 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No conversations found</p>
                        <p className="text-xs mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Contact</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Intent</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Urgency</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommended Action</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {conversations.map(conv => (
                                <tr
                                    key={conv.id}
                                    className={`table-row-hover group ${conv.status === 'unattended' ? 'bg-violet-50/30' : ''}`}
                                    onClick={() => onView(conv)}
                                >
                                    {/* Phone */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${conv.status === 'unattended' ? 'bg-violet-100' : 'bg-brand-50'}`}>
                                                <Phone className={`w-3.5 h-3.5 ${conv.status === 'unattended' ? 'text-violet-500' : 'text-accent'}`} />
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 text-sm block">{conv.phone}</span>
                                                {conv.summaryHistory && conv.summaryHistory.length > 1 && (
                                                    <span className="text-[10px] text-gray-400 font-medium">{conv.summaryHistory.length} contacts</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Last Contact */}
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-gray-700 font-medium">
                                                {conv.lastContactAt
                                                    ? formatDistanceToNow(new Date(conv.lastContactAt), { addSuffix: true })
                                                    : format(new Date(conv.date + 'T00:00:00'), 'dd MMM yyyy')}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {conv.date && format(new Date(conv.date + 'T00:00:00'), 'dd MMM yyyy')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Intent */}
                                    <td className="px-6 py-4 max-w-[220px]">
                                        <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{conv.intent}</p>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={conv.status} />
                                    </td>

                                    {/* Urgency */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <UrgencyBadge text={conv.urgencyText} />
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4 max-w-[200px]">
                                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{conv.actionRequired}</p>
                                    </td>

                                    {/* View button */}
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <button
                                            onClick={e => { e.stopPropagation(); onView(conv); }}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-50 text-accent text-xs font-semibold hover:bg-brand-100 transition-colors duration-200"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
