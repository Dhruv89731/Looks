// Mock conversation data simulating GET /api/conversations
// New shape: summaryHistory array, status, lastContactAt

const now = new Date();
const hoursAgo = (h) => new Date(now - h * 3600000).toISOString();

export const mockConversations = [
    {
        id: 1,
        phone: "+91 99887 76655",
        conversationId: "+91 99887 76655",
        date: "2026-03-11",
        intent: "Customer wants to book a bridal appointment for March 20th.",
        urgencyText: "High",
        urgencyNumber: 3,
        actionRequired: "Call this customer immediately to confirm the bridal slot.",
        fullSummary: "Customer called at 9PM asking about bridal package for March 20th wedding day. Very urgent.",
        status: "unattended",
        lastContactAt: hoursAgo(1),
        receivedAt: hoursAgo(1),
        summaryHistory: [
            {
                timestamp: hoursAgo(1),
                intent: "Customer wants to book a bridal appointment for March 20th.",
                urgencyText: "High",
                actionRequired: "Call this customer immediately to confirm the bridal slot.",
                fullSummary: "Customer called at 9PM asking about bridal package for March 20th wedding day. Very urgent.",
            },
            {
                timestamp: hoursAgo(26),
                intent: "Inquiry about bridal package pricing.",
                urgencyText: "Medium",
                actionRequired: "Send pricing details via WhatsApp.",
                fullSummary: "Customer first called yesterday asking about bridal package options and rough pricing.",
            }
        ],
    },
    {
        id: 2,
        phone: "919909063333",
        conversationId: "919909063333",
        date: "2026-03-10",
        intent: "The customer is trying to inquire about services offered at the salon.",
        urgencyText: "Low",
        urgencyNumber: 1,
        actionRequired: "Staff should review messages in the inbox.",
        fullSummary: "Customer inquired about general salon services and pricing.",
        status: "active",
        lastContactAt: hoursAgo(3),
        receivedAt: hoursAgo(3),
        summaryHistory: [
            {
                timestamp: hoursAgo(3),
                intent: "The customer is trying to inquire about services offered at the salon.",
                urgencyText: "Low",
                actionRequired: "Staff should review messages in the inbox.",
                fullSummary: "Customer inquired about general salon services and pricing.",
            }
        ],
    },
    {
        id: 3,
        phone: "+91 87654 32109",
        conversationId: "+91 87654 32109",
        date: "2026-03-11",
        intent: "Inquiry about hair color treatment pricing and availability.",
        urgencyText: "Medium",
        urgencyNumber: 2,
        actionRequired: "Send a WhatsApp message with pricing menu for hair color treatments.",
        fullSummary: `Customer called at 8:45 PM asking about hair color services. Specifically interested in balayage and full head color options.`,
        status: "unattended",
        lastContactAt: hoursAgo(5),
        receivedAt: hoursAgo(5),
        summaryHistory: [
            {
                timestamp: hoursAgo(5),
                intent: "Inquiry about hair color treatment pricing and availability.",
                urgencyText: "Medium",
                actionRequired: "Send a WhatsApp message with pricing menu for hair color treatments.",
                fullSummary: "Customer called at 8:45 PM asking about hair color services. Interested in balayage.",
            }
        ],
    },
    {
        id: 4,
        phone: "+91 76543 21098",
        conversationId: "+91 76543 21098",
        date: "2026-03-11",
        intent: "Customer asking about bridal package and group booking for wedding.",
        urgencyText: "High",
        urgencyNumber: 3,
        actionRequired: "Priority callback – discuss bridal packages, pricing, and schedule a consultation meeting.",
        fullSummary: `High-value inquiry: Customer called at 7:30 PM regarding a bridal package for a wedding happening on March 28th.`,
        status: "active",
        lastContactAt: hoursAgo(8),
        receivedAt: hoursAgo(8),
        summaryHistory: [
            {
                timestamp: hoursAgo(8),
                intent: "Customer asking about bridal package and group booking for wedding.",
                urgencyText: "High",
                actionRequired: "Priority callback – discuss bridal packages, pricing, and schedule a consultation meeting.",
                fullSummary: "High-value inquiry: bridal group of 5, wedding on March 28th.",
            }
        ],
    },
];

export const getUrgencyConfig = (urgencyText) => {
    switch (urgencyText?.toLowerCase()) {
        case 'high':
            return { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', dot: 'bg-red-500', badge: 'badge-high' };
        case 'medium':
            return { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', dot: 'bg-amber-500', badge: 'badge-medium' };
        case 'low':
        default:
            return { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', dot: 'bg-emerald-500', badge: 'badge-low' };
    }
};

export const getTopIntents = (conversations) => {
    const categories = {
        'Haircut & Styling': 0,
        'Hair Color & Treatment': 0,
        'Bridal & Group Booking': 0,
        'Spa & Skin Care': 0,
        'Nail Services': 0,
        'Appointment Changes': 0,
        'Pricing & Membership': 0,
        'Complaints': 0,
    };

    conversations.forEach(({ intent }) => {
        const lower = (intent || '').toLowerCase();
        if (lower.includes('haircut') || lower.includes('style') || lower.includes('blow')) categories['Haircut & Styling']++;
        else if (lower.includes('color') || lower.includes('keratin') || lower.includes('extension') || lower.includes('smooth')) categories['Hair Color & Treatment']++;
        else if (lower.includes('bridal') || lower.includes('wedding') || lower.includes('group')) categories['Bridal & Group Booking']++;
        else if (lower.includes('spa') || lower.includes('facial') || lower.includes('skin')) categories['Spa & Skin Care']++;
        else if (lower.includes('nail') || lower.includes('manicure') || lower.includes('pedicure')) categories['Nail Services']++;
        else if (lower.includes('reschedule') || lower.includes('cancel') || lower.includes('appointment')) categories['Appointment Changes']++;
        else if (lower.includes('membership') || lower.includes('pricing') || lower.includes('loyalty') || lower.includes('price')) categories['Pricing & Membership']++;
        else if (lower.includes('complaint') || lower.includes('redo') || lower.includes('unhappy')) categories['Complaints']++;
    });

    return Object.entries(categories)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);
};
