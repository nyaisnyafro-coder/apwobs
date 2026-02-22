import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Calendar, CheckCircle } from 'lucide-react';
import NewsCard from '../components/NewsCard';

// Mock data for development - In production this comes from API
// Mock categories removed

// MOCK_NEWS removed - fetching from API
const API_BASE = '/api/v1';

export default function NewsVerification() {
    const [searchParams] = useSearchParams();
    const urlFilter = searchParams.get('filter'); // crisis, etc.
    const urlCategory = searchParams.get('category');

    const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
    const [selectedDate, setSelectedDate] = useState('today');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [newsItems, setNewsItems] = useState([]);
    const [totalNews, setTotalNews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [categories, setCategories] = useState([]);

    // Sync URL params with state
    useEffect(() => {
        if (urlFilter === 'crisis') {
            setSelectedStatus('unverified'); // Kriz modu = teyitsiz haberler
        }
        if (urlCategory) {
            setSelectedCategory(urlCategory);
        }
    }, [urlFilter, urlCategory]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/news/categories`);
            if (res.ok) {
                const data = await res.json();
                // Safety check: data must be array
                if (Array.isArray(data)) {
                    const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);
                    setCategories([{ id: 'all', name: 'Tümü', count: total }, ...data]);
                } else {
                    console.error("Categories format invalid", data);
                    setCategories([]);
                }
            }
        } catch (e) {
            console.error("Cat fetch error", e);
            setCategories([]);
        }
    }, []);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);

            // Status filter
            if (selectedStatus) params.append('status', selectedStatus);

            // Date filters
            if (selectedDate === '1hour') params.append('hours', 1);
            else if (selectedDate === 'today') params.append('hours', 24);
            else if (selectedDate === 'week') params.append('hours', 168);
            else if (selectedDate === 'month') params.append('hours', 720);

            // API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout

            try {
                const res = await fetch(`${API_BASE}/news?${params.toString()}`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.status === 401) {
                    setError('auth');
                    setLoading(false);
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setNewsItems(Array.isArray(data.news) ? data.news : []);
                    setTotalNews(data.total || 0);
                } else {
                    setError('Haberler alınamadı.');
                }
            } catch (fetchErr) {
                if (fetchErr.name === 'AbortError') {
                    setError('Sunucu yanıt vermedi (Zaman aşımı).');
                } else {
                    console.error("News fetch error:", fetchErr);
                    setError('Bağlantı hatası.');
                }
            }
        } catch (err) {
            console.error("General error:", err);
            setError('Beklenmedik hata.');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedStatus, selectedDate]);

    useEffect(() => {
        fetchNews();
        fetchCategories();
    }, [fetchNews, fetchCategories]);

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6">
            {/* Left Sidebar - Filters */}
            <div className="w-64 flex-shrink-0 space-y-6">
                {/* Header Info */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                        İstihbarat
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await fetch(`${API_BASE}/news/scan`, { method: 'POST' });
                                    await fetchNews();
                                    await fetchCategories();
                                } catch (e) { console.error(e); }
                            }}
                            className="bg-dark-card p-1.5 rounded-lg border border-dark-border hover:border-primary/50 text-gray-400 hover:text-primary transition-all"
                            title="Yenile ve Tara"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-6.219-8.56" /><path d="M21 3v9h-9" /></svg>
                        </button>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Canlı Haber Akışı ve Teyit</p>
                </div>

                {/* Categories */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Kategoriler
                    </h3>
                    <div className="space-y-1">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.name === 'Tümü' ? 'all' : category.name)} // API uses name for filtering usually
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${(selectedCategory === 'all' && category.id === 'all') || selectedCategory === category.name
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-gray-400 hover:bg-dark-card/50 hover:text-gray-200'
                                    }`}
                            >
                                <span>{category.name}</span>
                                <span className="bg-dark-bg px-2 py-0.5 rounded-full text-xs opacity-60">
                                    {category.count}
                                </span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* Date Filter */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Tarih Aralığı
                    </h3>
                    <div className="relative">
                        <select
                            className="w-full bg-dark-bg border border-dark-border rounded-lg text-sm px-3 py-2 text-gray-300 focus:outline-none focus:border-primary/50 appearance-none"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        >
                            <option value="1hour">Son 1 Saat</option>
                            <option value="today">Son 24 Saat</option>
                            <option value="week">Bu Hafta</option>
                            <option value="month">Bu Ay</option>
                        </select>
                        <div className="absolute right-3 top-2.5 pointer-events-none text-xs text-gray-500">
                            {newsItems.length < totalNews ? `${newsItems.length} / ${totalNews}` : totalNews} Haber
                        </div>
                    </div>
                </div>

                {/* Quick Status Filter */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> Teyit Durumu
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedStatus(selectedStatus === 'verified' ? null : 'verified')}
                            className={`flex-1 text-xs py-1.5 rounded border transition-colors ${selectedStatus === 'verified'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20'
                                }`}
                        >
                            Güvenilir
                        </button>
                        <button
                            onClick={() => setSelectedStatus(selectedStatus === 'uncertain' ? null : 'uncertain')}
                            className={`flex-1 text-xs py-1.5 rounded border transition-colors ${selectedStatus === 'uncertain'
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                                }`}
                        >
                            Şüpheli
                        </button>
                        <button
                            onClick={() => setSelectedStatus(selectedStatus === 'unverified' ? null : 'unverified')}
                            className={`flex-1 text-xs py-1.5 rounded border transition-colors ${selectedStatus === 'unverified'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                }`}
                        >
                            Teyitsiz
                        </button>
                    </div>
                </div>

                {/* Calendar removed here; dashboard already has a single shared calendar. */}
            </div>

            {/* Main Content - News Grid */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="text-center col-span-full py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Haberler Yükleniyor...</p>
                        </div>
                    ) : error === 'auth' ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-6 bg-dark-card border border-red-500/20 rounded-2xl mx-auto max-w-lg mt-10 p-10 shadow-2xl">
                            <div className="p-6 bg-red-500/10 rounded-full animate-bounce">
                                <span className="text-4xl">🔒</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">Oturum Açmanız Gerekiyor</h3>
                                <p className="text-gray-400">Verilere erişmek için lütfen giriş yapın.</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    ) : error ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-red-400 text-xl font-bold mb-2">Bir Hata Oluştu</p>
                            <p className="text-gray-500">{error}</p>
                            <button
                                onClick={fetchNews}
                                className="mt-4 text-primary hover:underline"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    ) : (!newsItems || newsItems.length === 0) ? (
                        <div className="col-span-full text-center py-20 flex flex-col items-center justify-center opacity-50">
                            <span className="text-6xl mb-4">📭</span>
                            <h3 className="text-xl font-bold text-gray-300">Henüz Haber Yok</h3>
                            <p className="text-gray-500">Kriterlere uygun haber bulunamadı.</p>
                        </div>
                    ) : (
                        newsItems.map(news => (
                            <NewsCard key={news.id} news={news} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
