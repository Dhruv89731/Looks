import { Search, Filter, ArrowUpDown, Eye, Phone, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { getUrgencyConfig } from '../data/mockData';
import { format } from 'date-fns';

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

export default function ConversationTable({
    conversations,
    search, setSearch,
    urgencyFilter, setUrgencyFilter,
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
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
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
                            className="input-field pl-9 pr-8 appearance-none cursor-pointer min-w-[150px]"
                        >
                            <option value="all">All Urgencies</option>
                            <option value="high">🔴 High</option>
                            <option value="medium">🟠 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="input-field pl-9 cursor-pointer min-w-[170px]"
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
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Customer
                                </th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Date
                                </th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Intent
                                </th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Urgency
                                </th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Recommended Action
                                </th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {conversations.map(conv => (
                                <tr
                                    key={conv.id}
                                    className="table-row-hover group"
                                    onClick={() => onView(conv)}
                                >
                                    {/* Phone */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                                                <Phone className="w-3.5 h-3.5 text-accent" />
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{conv.phone}</span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                        {format(new Date(conv.date + 'T00:00:00'), 'dd MMM yyyy')}
                                    </td>

                                    {/* Intent */}
                                    <td className="px-6 py-4 max-w-[250px]">
                                        <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{conv.intent}</p>
                                    </td>

                                    {/* Urgency */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <UrgencyBadge text={conv.urgencyText} />
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4 max-w-[220px]">
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
