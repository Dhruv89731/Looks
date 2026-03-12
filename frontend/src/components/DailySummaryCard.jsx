import { TrendingUp, Scissors, Palette, Heart, Sparkles, Star, HelpCircle, AlertOctagon } from 'lucide-react';
import { mockConversations, getTopIntents } from '../data/mockData';

const intentIcons = {
    'Haircut & Styling': Scissors,
    'Hair Color & Treatment': Palette,
    'Bridal & Group Booking': Heart,
    'Spa & Skin Care': Sparkles,
    'Nail Services': Star,
    'Appointment Changes': HelpCircle,
    'Pricing & Membership': TrendingUp,
    'Complaints': AlertOctagon,
};

const intentColors = [
    { text: 'text-accent', bg: 'bg-brand-50', border: 'border-brand-100' },
    { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

export default function DailySummaryCard({ conversations }) {
    const source = (conversations && conversations.length > 0) ? conversations : mockConversations;
    const topIntents = getTopIntents(source);

    return (
        <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Today's Top Requests</h3>
                    <p className="text-xs text-gray-500">Most common customer inquiries</p>
                </div>
            </div>

            <div className="space-y-2.5">
                {topIntents.map(([intent, count], index) => {
                    const Icon = intentIcons[intent] || HelpCircle;
                    const colorSet = intentColors[index % intentColors.length];
                    const percentage = Math.round((count / source.length) * 100);

                    return (
                        <div
                            key={intent}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${colorSet.bg} ${colorSet.border}`}
                        >
                            <div className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <Icon className={`w-3.5 h-3.5 ${colorSet.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold ${colorSet.text} truncate`}>{intent}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colorSet.text.replace('text-', 'bg-')}`}
                                            style={{ width: `${Math.max(percentage * 1.5, 20)}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs ${colorSet.text} font-medium whitespace-nowrap`}>{count} call{count !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            {index === 0 && (
                                <span className="text-xs bg-white text-amber-600 font-bold px-2 py-0.5 rounded-md border border-amber-200 shadow-sm flex-shrink-0">
                                    #1
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
