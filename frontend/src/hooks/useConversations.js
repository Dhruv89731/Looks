import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockConversations } from '../data/mockData';

const API_BASE = 'http://p8o84wcccws4kwwc8s4kkcsg.76.13.243.185.sslip.io';
const LOCAL_API = 'http://localhost:3001';

/**
 * Normalize API responses – ensures every record has status + summaryHistory
 * regardless of when the backend was last deployed.
 */
function normalizeConversation(c) {
    return {
        ...c,
        status: c.status || 'unattended',
        lastContactAt: c.lastContactAt || c.receivedAt,
        summaryHistory: (Array.isArray(c.summaryHistory) && c.summaryHistory.length > 0)
            ? c.summaryHistory
            : [{
                timestamp: c.receivedAt || c.lastContactAt,
                intent: c.intent,
                urgencyText: c.urgencyText,
                actionRequired: c.actionRequired,
                fullSummary: c.fullSummary,
            }],
    };
}

/**
 * Fetches conversations from the real API.
 * Falls back to mock data if the API is unreachable (e.g. during dev without server).
 */
export function useConversations() {
    const [allConversations, setAllConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMock, setUsingMock] = useState(false);

    const [search, setSearch] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // all | active | unattended
    const [dateFilter, setDateFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchConversations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/conversations`, {
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data.length === 0) {
                setAllConversations(mockConversations);
                setUsingMock(true);
            } else {
                setAllConversations(data.map(normalizeConversation));
                setUsingMock(false);
            }
        } catch (err) {
            console.warn('[useConversations] Remote API unreachable, trying local:', err.message);
            // Try local backend before falling back to mock
            try {
                const localRes = await fetch(`${LOCAL_API}/api/conversations`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (!localRes.ok) throw new Error(`Local HTTP ${localRes.status}`);
                const localData = await localRes.json();
                if (localData.length === 0) {
                    setAllConversations(mockConversations);
                    setUsingMock(true);
                } else {
                    setAllConversations(localData.map(normalizeConversation));
                    setUsingMock(false);
                }
                setError(null);
            } catch (localErr) {
                console.warn('[useConversations] Local API also unreachable, using mock:', localErr.message);
                setAllConversations(mockConversations);
                setUsingMock(true);
                setError('API offline – showing demo data');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(fetchConversations, 60_000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Client-side filtering + sorting
    const conversations = useMemo(() => {
        let data = [...allConversations];

        if (search.trim()) {
            const q = search.trim().toLowerCase().replace(/\s/g, '');
            data = data.filter(c =>
                (c.phone || '').replace(/\s/g, '').toLowerCase().includes(q)
            );
        }

        if (urgencyFilter !== 'all') {
            data = data.filter(c => (c.urgencyText || '').toLowerCase() === urgencyFilter.toLowerCase());
        }

        if (statusFilter !== 'all') {
            data = data.filter(c => (c.status || 'unattended') === statusFilter);
        }

        if (dateFilter) {
            data = data.filter(c => c.date === dateFilter);
        }

        // Primary sort: by lastContactAt descending (most recent contact first)
        // Secondary sort: by urgency (if timestamp matches)
        data.sort((a, b) => {
            const timeDiff = new Date(b.lastContactAt || b.receivedAt || 0) - new Date(a.lastContactAt || a.receivedAt || 0);
            if (timeDiff !== 0) return timeDiff;
            return sortOrder === 'desc'
                ? (b.urgencyNumber || 0) - (a.urgencyNumber || 0)
                : (a.urgencyNumber || 0) - (b.urgencyNumber || 0);
        });

        return data;
    }, [allConversations, search, urgencyFilter, statusFilter, dateFilter, sortOrder]);

    const stats = useMemo(() => ({
        total: allConversations.length,
        active: allConversations.filter(c => c.status === 'active').length,
        unattended: allConversations.filter(c => c.status === 'unattended').length,
        high: allConversations.filter(c => c.urgencyText === 'High').length,
        medium: allConversations.filter(c => c.urgencyText === 'Medium').length,
        low: allConversations.filter(c => c.urgencyText === 'Low').length,
    }), [allConversations]);

    const markAsResolved = async (id) => {
        // Optimistically remove from active list + mark resolved
        setAllConversations(prev => prev.filter(c => c.id !== id));

        const endpoints = usingMock
            ? [`${LOCAL_API}/api/conversations/${id}/resolve`]
            : [`${API_BASE}/api/conversations/${id}/resolve`, `${LOCAL_API}/api/conversations/${id}/resolve`];

        for (const url of endpoints) {
            try {
                const res = await fetch(url, { method: 'PATCH' });
                if (res.ok) break; // success — stop trying
            } catch (e) {
                console.warn(`[useConversations] resolve failed on ${url}:`, e.message);
            }
        }
    };

    const markAsViewed = async (id) => {
        // When an agent views a conversation, set it to "active"
        setAllConversations(prev =>
            prev.map(c => c.id === id && c.status === 'unattended' ? { ...c, status: 'active' } : c)
        );

        const url = usingMock
            ? `${LOCAL_API}/api/conversations/${id}/status`
            : `${API_BASE}/api/conversations/${id}/status`;

        try {
            await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });
        } catch (e) {
            // Try local fallback
            try {
                await fetch(`${LOCAL_API}/api/conversations/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'active' }),
                });
            } catch (e2) {
                console.warn('[useConversations] markAsViewed failed:', e2.message);
            }
        }
    };

    return {
        conversations,
        stats,
        loading,
        error,
        usingMock,
        refetch: fetchConversations,
        markAsResolved,
        markAsViewed,
        search, setSearch,
        urgencyFilter, setUrgencyFilter,
        statusFilter, setStatusFilter,
        dateFilter, setDateFilter,
        sortOrder, setSortOrder,
    };
}
