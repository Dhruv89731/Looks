import { useEffect } from 'react';
import { X, Phone, Calendar, Target, Zap, ClipboardList, FileText } from 'lucide-react';
import { getUrgencyConfig } from '../data/mockData';
import { format } from 'date-fns';

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

export default function ConversationDrawer({ conversation, onClose }) {
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
                        <h2 className="text-lg font-bold text-gray-900">Conversation Details</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Full summary from AI receptionist</p>
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
                            label="Date"
                            value={format(new Date(conversation.date + 'T00:00:00'), 'dd MMM yyyy')}
                        />
                    </div>

                    {/* Intent */}
                    <DetailRow
                        icon={Target}
                        label="Customer Intent"
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

                    {/* Full Summary */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-sm font-bold text-gray-800">Conversation Summary</span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {conversation.fullSummary}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="btn-primary w-full justify-center"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}
