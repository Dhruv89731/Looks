// Mock conversation data simulating GET /api/conversations
export const mockConversations = [
    {
        id: 1,
        phone: "+91 98765 43210",
        date: "2026-03-11",
        intent: "Customer wants to book a haircut appointment for tomorrow evening.",
        urgencyText: "High",
        urgencyNumber: 3,
        actionRequired: "Call the customer immediately to confirm appointment slot before tomorrow.",
        fullSummary: `The customer called after hours at 9:15 PM asking about haircut availability for tomorrow evening (March 12th) between 5 PM – 7 PM. They specifically requested Priya as their stylist.\n\nThe customer mentioned they have an important event the next day and are flexible with timing but want confirmation as soon as possible.\n\nThey also asked about the pricing for a haircut + blow dry combo and mentioned they're a returning customer.\n\nRecommended next step: Call back first thing in the morning to confirm the slot and confirm Priya's availability.`,
    },
    {
        id: 2,
        phone: "+91 87654 32109",
        date: "2026-03-11",
        intent: "Inquiry about hair color treatment pricing and availability.",
        urgencyText: "Medium",
        urgencyNumber: 2,
        actionRequired: "Send a WhatsApp message with pricing menu for hair color treatments.",
        fullSummary: `Customer called at 8:45 PM asking about hair color services. Specifically interested in balayage and full head color options.\n\nThey asked about pricing, how long the procedure takes, and whether they need to book in advance or can walk in.\n\nThe customer sounded like they're planning for next weekend (March 14–15) and would like to know if weekend slots are available.\n\nThey mentioned they last colored their hair about 6 months ago at a different salon and want to try Looks Salon based on a friend's recommendation.`,
    },
    {
        id: 3,
        phone: "+91 76543 21098",
        date: "2026-03-11",
        intent: "Customer asking about bridal package and group booking for wedding.",
        urgencyText: "High",
        urgencyNumber: 3,
        actionRequired: "Priority callback – discuss bridal packages, pricing, and schedule a consultation meeting.",
        fullSummary: `High-value inquiry: Customer called at 7:30 PM regarding a bridal package for a wedding happening on March 28th (17 days away).\n\nThe wedding party includes the bride + 4 bridesmaids. They're looking for a full package including hair styling, makeup, saree draping, and threading for all 5 people.\n\nCustomer asked whether Looks Salon can accommodate a group of 5 on the wedding morning (starting 5 AM) and what the total package cost would be.\n\nThis is an urgent and high-value booking. Recommend scheduling an in-person consultation or video call this week to discuss requirements and secure the date.`,
    },
    {
        id: 4,
        phone: "+91 65432 10987",
        date: "2026-03-11",
        intent: "Question about membership and loyalty card benefits.",
        urgencyText: "Low",
        urgencyNumber: 1,
        actionRequired: "No urgent action needed. Share membership brochure / details via WhatsApp when convenient.",
        fullSummary: `Customer called at 10:00 PM asking about the Looks Salon membership program. They wanted to know:\n- How the loyalty card works\n- What discounts are offered to members\n- Whether memberships can be gifted to someone else\n- Monthly vs annual membership pricing\n\nThis customer appears to be a prospective new member. They were not in a hurry and said they'd come in person to discuss whenever the salon is open.\n\nNo urgency – informational inquiry only.`,
    },
    {
        id: 5,
        phone: "+91 54321 09876",
        date: "2026-03-11",
        intent: "Complaint about a previous haircut service, requesting a redo.",
        urgencyText: "High",
        urgencyNumber: 3,
        actionRequired: "Call the customer today to apologize and offer a complimentary redo appointment.",
        fullSummary: `The customer visited 3 days ago for a haircut. They called at 8:00 PM expressing displeasure with the outcome – specifically that the layers were uneven and the length is shorter than requested.\n\nThey're frustrated and asked whether the salon offers a free correction service. The customer mentioned they have photos to show the issue.\n\nThis requires sensitive handling. Recommend a priority callback to:\n1. Listen and empathize\n2. Offer complimentary redo service\n3. Schedule them with a senior stylist\n\nHandling this promptly will prevent a negative review.`,
    },
    {
        id: 6,
        phone: "+91 43210 98765",
        date: "2026-03-11",
        intent: "Asking about keratin treatment and hair smoothening options.",
        urgencyText: "Medium",
        urgencyNumber: 2,
        actionRequired: "Call back to explain treatment options and schedule a patch test consultation.",
        fullSummary: `Customer called at 9:45 PM asking about keratin treatment and smoothening options for frizzy hair. They have thick, curly hair and want a long-lasting smoothening solution.\n\nThey asked:\n- How long keratin treatment lasts\n- Whether there are any side effects\n- Price comparison between Brazilian keratin vs Japanese straightening\n- Whether they need a patch test beforehand\n\nCustomer is open to visiting for a consultation. Recommend calling back to explain options and set up an appointment.`,
    },
    {
        id: 7,
        phone: "+91 32109 87654",
        date: "2026-03-11",
        intent: "Inquiry about spa and facial treatments for sensitive skin.",
        urgencyText: "Low",
        urgencyNumber: 1,
        actionRequired: "Share spa menu and available hypoallergenic treatment options via WhatsApp.",
        fullSummary: `Customer called at 11:00 PM asking about facial and spa treatments specifically suitable for sensitive skin. They mentioned they have rosacea-prone skin and are looking for gentle, dermatologist-approved treatments.\n\nThey also asked if the salon has certified aestheticians for skin treatments.\n\nThis is a non-urgent informational inquiry. Customer said they are planning a visit next week and would like to review options before booking.`,
    },
    {
        id: 8,
        phone: "+91 21098 76543",
        date: "2026-03-11",
        intent: "Wants to reschedule an existing appointment booked for tomorrow.",
        urgencyText: "High",
        urgencyNumber: 3,
        actionRequired: "Reschedule the customer's appointment first thing in the morning before their original slot.",
        fullSummary: `Customer called at 8:30 PM trying to reschedule an appointment they have booked for tomorrow (March 12th) at 10:00 AM. They said something has come up and they need to move it to March 14th or 15th.\n\nThey were apologetic but firm about the change. Since staff cannot access the booking system outside of hours, the bot informed them someone will call back.\n\nUrgent: This must be handled first thing in the morning to free up tomorrow's slot and confirm their new date before it's too late.`,
    },
    {
        id: 9,
        phone: "+91 19876 54321",
        date: "2026-03-11",
        intent: "Asking about nail art and manicure/pedicure services.",
        urgencyText: "Low",
        urgencyNumber: 1,
        actionRequired: "No immediate action. Share nail services menu and pricing when available.",
        fullSummary: `Customer called at 10:30 PM with a general inquiry about nail services offered at the salon. They were interested in:\n- Gel nail art designs available\n- Manicure and pedicure pricing\n- Whether they have nail extension services\n- Walk-in availability\n\nFriendly and non-urgent inquiry. No booking was requested. Customer said they'll call again during business hours.`,
    },
    {
        id: 10,
        phone: "+91 87601 23456",
        date: "2026-03-11",
        intent: "Asking about hair extension services and pricing.",
        urgencyText: "Medium",
        urgencyNumber: 2,
        actionRequired: "Call back to discuss hair extension options, share catalog images, and schedule a consultation.",
        fullSummary: `Customer called at 9:00 PM asking about hair extension services. They want to add volume and length for an upcoming event.\n\nThey asked:\n- Types of extensions available (clip-in, tape-in, fusion)\n- How long the application takes\n- Cost range\n- Maintenance requirements\n\nCustomer seemed serious about booking. Recommend calling back with catalog images and scheduling a consultation to assess their hair type and recommend the right extension method.`,
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
        const lower = intent.toLowerCase();
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
