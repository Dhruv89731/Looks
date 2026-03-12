import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockConversations } from '../data/mockData';

const API_BASE = 'http://localhost:3001';

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

            // If API returns empty array, show mock data so dashboard isn't blank
            if (data.length === 0) {
                setAllConversations(mockConversations);
                setUsingMock(true);
            } else {
                setAllConversations(data);
                setUsingMock(false);
            }
        } catch (err) {
            console.warn('[useConversations] API unreachable, using mock data:', err.message);
            setAllConversations(mockConversations);
            setUsingMock(true);
            setError('API offline – showing demo data');
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

    // Client-side filtering (API already sorts, we do local filter for instant UX)
    const conversations = useMemo(() => {
        let data = [...allConversations];

        if (search.trim()) {
            const q = search.trim().toLowerCase().replace(/\s/g, '');
            data = data.filter(c =>
                (c.phone || '').replace(/\s/g, '').toLowerCase().includes(q)
            );
        }

        if (urgencyFilter !== 'all') {
            data = data.filter(
                c => (c.urgencyText || '').toLowerCase() === urgencyFilter.toLowerCase()
            );
        }

        if (dateFilter) {
            data = data.filter(c => c.date === dateFilter);
        }

        data.sort((a, b) =>
            sortOrder === 'desc'
                ? (b.urgencyNumber || 0) - (a.urgencyNumber || 0)
                : (a.urgencyNumber || 0) - (b.urgencyNumber || 0)
        );

        return data;
    }, [allConversations, search, urgencyFilter, dateFilter, sortOrder]);

    const stats = useMemo(() => ({
        total: allConversations.length,
        high: allConversations.filter(c => c.urgencyText === 'High').length,
        medium: allConversations.filter(c => c.urgencyText === 'Medium').length,
        low: allConversations.filter(c => c.urgencyText === 'Low').length,
    }), [allConversations]);

    return {
        conversations,
        stats,
        loading,
        error,
        usingMock,
        refetch: fetchConversations,
        search, setSearch,
        urgencyFilter, setUrgencyFilter,
        dateFilter, setDateFilter,
        sortOrder, setSortOrder,
    };
}
