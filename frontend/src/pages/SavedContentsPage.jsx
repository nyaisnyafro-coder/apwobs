import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star, FileText, Copy, ExternalLink, Newspaper, CalendarDays } from 'lucide-react';

const VIEW_OPTIONS = [
    { id: 'post', label: 'Post' },
    { id: 'bulletin', label: 'Bülten' },
    { id: 'archive', label: 'Arşiv' },
];

function parseContent(content) {
    if (!content) return null;
    if (typeof content === 'object') return content;
    try {
        return JSON.parse(content);
    } catch {
        return null;
    }
}

export default function SavedContentsPage() {
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('post');
    const [newsletterPreview, setNewsletterPreview] = useState('');
    const [newsletterData, setNewsletterData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        fetchContents();
    }, []);

    const fetchContents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/news?hours=336');
            if (res.ok) {
                const data = await res.json();
                setContents(Array.isArray(data.news) ? data.news : []);
            }
        } catch (err) {
            console.error('Error fetching contents:', err);
        } finally {
            setLoading(false);
        }
    };

    const postItems = useMemo(() => contents.filter((item) => !!item.generated_content), [contents]);
    const archiveItems = useMemo(() => contents.filter((item) => !!item.is_starred), [contents]);
    const bulletinItems = useMemo(() => contents.filter((item) => !!item.is_weekly_selected), [contents]);

    const activeItems = view === 'archive' ? archiveItems : view === 'bulletin' ? bulletinItems : postItems;

    const handleCopyContent = (content) => {
        if (!content) return;
        const text = `${content.bolum1?.baslik || ''}\n\n${content.bolum1?.metin || ''}\n\n${content.bolum2?.metin || ''}\n\n${content.bolum3?.metin || ''}\n\n${content.analiz?.metin || ''}`;
        navigator.clipboard.writeText(text);
        alert('İçerik panoya kopyalandı.');
    };

    const toggleWeekly = async (newsId) => {
        try {
            const res = await fetch(`/api/v1/newsletter/news/${newsId}/weekly-toggle`, { method: 'PUT' });
            if (res.ok) {
                fetchContents();
            }
        } catch (err) {
            console.error('Weekly toggle error:', err);
        }
    };

    const loadNewsletterPreview = async () => {
        setPreviewLoading(true);
        try {
            const res = await fetch('/api/v1/newsletter/preview');
            if (res.ok) {
                const data = await res.json();
                setNewsletterPreview(data.content || 'Bülten önizlemesi oluşturulamadı.');
                setNewsletterData(data.data || null);
            }
        } catch (err) {
            console.error('Newsletter preview error:', err);
            setNewsletterPreview('Bülten önizlemesi alınamadı.');
            setNewsletterData(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        İçerikler
                    </h2>
                    <p className="text-gray-500 mt-1">Post, haftalık bülten ve arşiv akışları</p>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-1 flex items-center gap-1">
                    {VIEW_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setView(option.id)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                view === option.id ? 'bg-primary/20 text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'bulletin' && (
                <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            Haftalık bülten seçimleri
                        </div>
                        <button
                            onClick={loadNewsletterPreview}
                            disabled={previewLoading}
                            className="bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50"
                        >
                            {previewLoading ? 'Hazırlanıyor...' : 'Bülten Önizle'}
                        </button>
                    </div>
                    {newsletterData && (
                        <div className="bg-dark-bg/60 border border-dark-border rounded-lg p-4 space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-100">{newsletterData.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">{newsletterData.intro}</p>
                            </div>
                            {newsletterData.stats?.categories?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {newsletterData.stats.categories.map((cat) => (
                                        <span key={cat.name} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                                            {cat.name} ({cat.count})
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {(newsletterData.items || []).map((item) => (
                                    <div key={item.id} className="border border-dark-border rounded-lg p-3 bg-dark-card/70">
                                        <p className="text-sm font-semibold text-gray-200">{item.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.category} • {item.source}</p>
                                        <p className="text-xs text-gray-300 mt-2 line-clamp-4">{item.summary}</p>
                                    </div>
                                ))}
                            </div>
                            <details className="text-xs">
                                <summary className="cursor-pointer text-gray-400 hover:text-gray-200">Markdown metnini goster</summary>
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap mt-3">{newsletterPreview}</pre>
                            </details>
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-500 py-12">Yükleniyor...</div>
            ) : activeItems.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
                    <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">Bu görünümde içerik yok</h3>
                    <p className="text-gray-500 mb-4">İstihbarat sayfasından haber seçip içerik üretebilirsiniz.</p>
                    <button
                        onClick={() => navigate('/verify')}
                        className="bg-primary hover:bg-primary/90 text-dark-bg font-bold px-6 py-2 rounded-lg"
                    >
                        İstihbarat'a Git
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeItems.map((item) => {
                        const content = parseContent(item.generated_content);
                        return (
                            <div key={item.id} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                                <div className="p-4 border-b border-dark-border flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-200 line-clamp-2 mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            {item.source} • {item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : '-'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.is_starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                        {item.generated_content && <Sparkles className="w-4 h-4 text-purple-400" />}
                                    </div>
                                </div>

                                {content && (
                                    <div className="p-4 bg-dark-bg/30">
                                        <div className="text-sm text-gray-300 line-clamp-4">
                                            {content?.bolum1?.metin || content?.analiz?.metin || item.summary}
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 border-t border-dark-border flex gap-2 flex-wrap">
                                    {content && (
                                        <button
                                            onClick={() => handleCopyContent(content)}
                                            className="flex-1 min-w-[120px] bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                                        >
                                            <Copy className="w-3 h-3" /> Kopyala
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/content-studio', { state: { news: item } })}
                                        className="flex-1 min-w-[120px] bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                        <FileText className="w-3 h-3" /> Stüdyoda Aç
                                    </button>
                                    <button
                                        onClick={() => toggleWeekly(item.id)}
                                        className={`min-w-[120px] text-xs font-bold py-2 px-3 rounded-lg ${
                                            item.is_weekly_selected
                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                : 'bg-dark-bg text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        {item.is_weekly_selected ? 'Bültende' : 'Bültene Ekle'}
                                    </button>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 rounded-lg"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
