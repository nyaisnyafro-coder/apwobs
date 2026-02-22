/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Cache süresi (5 dakika)
const CACHE_DURATION = 5 * 60 * 1000;

const DataContext = createContext(null);

export function DataProvider({ children }) {
    // Stats cache
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const statsLastFetch = useRef(null);
    const statsTimeRange = useRef(null);

    // Intelligence cache
    const [intelligenceData, setIntelligenceData] = useState(null);
    const [intelligenceLoading, setIntelligenceLoading] = useState(false);
    const intelligenceLastFetch = useRef(null);

    // News cache
    const [newsData, setNewsData] = useState(null);
    const [newsLoading, setNewsLoading] = useState(false);
    const newsLastFetch = useRef(null);
    const newsFilters = useRef(null);

    // Check if cache is valid
    const isCacheValid = (lastFetch) => {
        if (!lastFetch) return false;
        return Date.now() - lastFetch < CACHE_DURATION;
    };

    // Fetch stats with caching
    const fetchStats = useCallback(async (timeRange = '24h', forceRefresh = false) => {
        // Return cached data if valid and same time range
        if (!forceRefresh && isCacheValid(statsLastFetch.current) && statsTimeRange.current === timeRange && statsData) {
            return statsData;
        }

        setStatsLoading(true);
        try {
            const res = await fetch(`/api/v1/stats/?range=${timeRange}`);
            if (res.ok) {
                const data = await res.json();
                setStatsData(data);
                statsLastFetch.current = Date.now();
                statsTimeRange.current = timeRange;
                return data;
            }
        } catch (err) {
            console.error('Stats fetch error:', err);
        } finally {
            setStatsLoading(false);
        }
        return null;
    }, [statsData]);

    // Fetch intelligence reports with caching
    const fetchIntelligence = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && isCacheValid(intelligenceLastFetch.current) && intelligenceData) {
            return intelligenceData;
        }

        setIntelligenceLoading(true);
        try {
            const res = await fetch('/api/v1/intelligence/');
            if (res.ok) {
                const data = await res.json();
                setIntelligenceData(data.data || {});
                intelligenceLastFetch.current = Date.now();
                return data.data;
            }
        } catch (err) {
            console.error('Intelligence fetch error:', err);
        } finally {
            setIntelligenceLoading(false);
        }
        return null;
    }, [intelligenceData]);

    // Fetch news with caching
    const fetchNews = useCallback(async (filters = {}, forceRefresh = false) => {
        const filterKey = JSON.stringify(filters);

        if (!forceRefresh && isCacheValid(newsLastFetch.current) && newsFilters.current === filterKey && newsData) {
            return newsData;
        }

        setNewsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.limit) params.append('limit', filters.limit);

            const res = await fetch(`/api/v1/news/?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setNewsData(data);
                newsLastFetch.current = Date.now();
                newsFilters.current = filterKey;
                return data;
            }
        } catch (err) {
            console.error('News fetch error:', err);
        } finally {
            setNewsLoading(false);
        }
        return null;
    }, [newsData]);

    // Invalidate specific cache
    const invalidateCache = useCallback((type = 'all') => {
        if (type === 'all' || type === 'stats') {
            statsLastFetch.current = null;
            setStatsData(null);
        }
        if (type === 'all' || type === 'intelligence') {
            intelligenceLastFetch.current = null;
            setIntelligenceData(null);
        }
        if (type === 'all' || type === 'news') {
            newsLastFetch.current = null;
            setNewsData(null);
        }
    }, []);

    // Auto-refresh every 5 minutes for active data
    useEffect(() => {
        const interval = setInterval(() => {
            // Only refresh if data was previously fetched
            if (statsLastFetch.current) {
                fetchStats(statsTimeRange.current || '24h', true);
            }
        }, CACHE_DURATION);

        return () => clearInterval(interval);
    }, [fetchStats]);

    const value = {
        // Stats
        stats: statsData,
        statsLoading,
        fetchStats,

        // Intelligence
        intelligence: intelligenceData,
        intelligenceLoading,
        fetchIntelligence,

        // News
        news: newsData,
        newsLoading,
        fetchNews,

        // Utils
        invalidateCache
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export default DataContext;
