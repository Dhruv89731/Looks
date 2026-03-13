import { useEffect } from 'react';
import { X, Phone, Calendar, Target, Zap, ClipboardList, FileText, Clock, History } from 'lucide-react';
import { getUrgencyConfig } from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';

function UrgencyBadge({ text }) {
    const config = getUrgencyConfig(text);
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border"
            style={{ color: config.color, backgroundColor: config.bg, borderColor: config.border }}
        >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
            {text} Urgency
        </span>
    );
}

function StatusBadge({ status }) {
    if (!status) return null;
    const styles = {
        unattended: 'bg-violet-100 text-violet-700 border-violet-200',
        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        resolved: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${styles[status] || styles.active}`}>
            <Clock className="w-3 h-3" />
            {status}
        </span>
    );
}

function DetailRow({ icon: Icon, label, value, className = '' }) {
    return (
        <div className={`flex gap-3 ${className}`}>
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mt-0.5">
                <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm text-gray-800 font-medium leading-snug">{value}</p>
            </div>
        </div>
    );
}

export default function ConversationDrawer({ conversation, onClose, onResolve, onView }) {
    // Close on Escape key
    useEffect(() => {
        if (!conversation) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [conversation, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = conversation ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [conversation]);

    if (!conversation) return null;

    const config = getUrgencyConfig(conversation.urgencyText);
    const summaryHistory = Array.isArray(conversation.summaryHistory) && conversation.summaryHistory.length > 0
        ? conversation.summaryHistory
        : [{ // fallback for old data shape
            timestamp: conversation.lastContactAt || conversation.receivedAt,
            intent: conversation.intent,
            urgencyText: conversation.urgencyText,
            actionRequired: conversation.actionRequired,
            fullSummary: conversation.fullSummary,
        }];

    const isResolved = conversation.status === 'resolved';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-drawer z-50 flex flex-col animate-slide-in">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-5 border-b border-gray-100"
                    style={{ borderLeftWidth: 4, borderLeftColor: config.color, borderLeftStyle: 'solid' }}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-lg font-bold text-gray-900">Conversation Details</h2>
                            <StatusBadge status={conversation.status} />
                        </div>
                        <p className="text-xs text-gray-500">
                            {summaryHistory.length > 1 ? `${summaryHistory.length} contacts · ` : ''}
                            Full summary from AI receptionist
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Quick Info Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <DetailRow icon={Phone} label="Customer Phone" value={conversation.phone} />
                        <DetailRow
                            icon={Calendar}
                            label="Last Contact"
                            value={conversation.lastContactAt
                                ? formatDistanceToNow(new Date(conversation.lastContactAt), { addSuffix: true })
                                : (conversation.date ? format(new Date(conversation.date + 'T00:00:00'), 'dd MMM yyyy') : '—')}
                        />
                    </div>

                    {/* Latest Intent */}
                    <DetailRow
                        icon={Target}
                        label="Latest Customer Intent"
                        value={conversation.intent}
                    />

                    {/* Urgency */}
                    <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Urgency Level</p>
                            <UrgencyBadge text={conversation.urgencyText} />
                        </div>
                    </div>

                    {/* Recommended Action */}
                    <div
                        className="rounded-2xl p-4 border"
                        style={{ backgroundColor: config.bg, borderColor: config.border }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="w-4 h-4" style={{ color: config.color }} />
                            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: config.color }}>
                                Recommended Action
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">
                            {conversation.actionRequired}
                        </p>
                    </div>

                    {/* Summary History */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                                <History className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-sm font-bold text-gray-800">Contact History</span>
                            {summaryHistory.length > 1 && (
                                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-accent text-xs font-semibold border border-brand-100">
                                    {summaryHistory.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {summaryHistory.map((entry, index) => (
                                <div
                                    key={index}
                                    className={`relative pl-4 border-l-2 ${index === 0 ? 'border-accent' : 'border-gray-200'}`}
                                >
                                    {/* Timeline dot */}
                                    <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${index === 0 ? 'bg-accent' : 'bg-gray-300'}`} />

                                    <div className={`card px-4 py-3 ${index === 0 ? 'border-brand-100 bg-brand-50/30' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-bold ${index === 0 ? 'text-accent' : 'text-gray-500'}`}>
                                                {index === 0 ? 'Latest' : `Contact #${summaryHistory.length - index}`}
                                            </span>
                                            {entry.timestamp && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                                                </div>
                                            )}
                                        </div>
                                        {entry.intent && (
                                            <p className="text-xs font-semibold text-gray-700 mb-1">{entry.intent}</p>
                                        )}
                                        {entry.fullSummary && (
                                            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                                                {entry.fullSummary}
                                            </p>
                                        )}
                                        {entry.urgencyText && (
                                            <div className="mt-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    entry.urgencyText === 'High' ? 'bg-red-100 text-red-700' :
                                                    entry.urgencyText === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {entry.urgencyText} Urgency
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn-ghost flex-1 justify-center bg-white border border-gray-200"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => {
                            if (onResolve) onResolve(conversation.id);
                            onClose();
                        }}
                        disabled={isResolved}
                        className={`btn-primary flex-1 justify-center transition-all ${
                            isResolved ? 'bg-emerald-500 hover:bg-emerald-600 cursor-default opacity-100' : ''
                        }`}
                    >
                        {isResolved ? 'Resolved ✓' : 'Mark as Resolved'}
                    </button>
                </div>
            </div>
        </>
    );
}
