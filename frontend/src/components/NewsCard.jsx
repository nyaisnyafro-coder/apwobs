import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, RefreshCw, AlertCircle, CheckCircle, XCircle, Sparkles, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export default function NewsCard({ news, onRefresh }) {
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(news.generated_content || null);
    const [isStarred, setIsStarred] = useState(news.is_starred || false);

    const statusConfig = {
        verified: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", label: "Doğrulandı" },
        uncertain: { icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Belirsiz" },
        unverified: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Doğrulanamadı" },
        pending: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", label: "İnceleniyor" },
        exempt: { icon: AlertCircle, color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/30", label: "Teyit Dışı" },
    };

    const status = statusConfig[news.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    const handleVerify = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsVerifying(true);

        try {
            const res = await fetch(`/api/v1/news/${news.id}/verify`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert(`Teyit Sonucu: ${data.result.status_text || data.result.status}`);
                if (onRefresh) onRefresh();
                else window.location.reload();
            } else {
                alert("Teyit başlatılamadı.");
            }
        } catch (err) {
            console.error(err);
            alert("Teyit hatası oluştu.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleGenerateContent = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsGenerating(true);

        try {
            const res = await fetch(`/api/v1/news/${news.id}/content`);
            if (res.ok) {
                const content = await res.json();
                if (content && content.bolum1) {
                    setGeneratedContent(content);
                    setShowContentModal(true);
                } else {
                    alert("İçerik üretilemedi. Lütfen daha sonra tekrar deneyin.");
                }
            } else {
                const err = await res.json().catch(() => ({}));
                alert(`Hata: ${err.detail || 'İçerik üretilemedi'}`);
            }
        } catch (err) {
            console.error(err);
            alert("İçerik üretim hatası oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleToggleStar = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(`/api/v1/news/${news.id}/star`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setIsStarred(data.is_starred);
            }
        } catch (err) {
            console.error('Star toggle error:', err);
        }
    };

    return (
        <>
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary/30 transition-colors group relative">
                {/* Hover Tooltip */}
                <div className="absolute top-full left-0 w-full mt-2 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="text-xs space-y-2">
                        <p><span className="text-gray-400">Yayınlanma:</span> <span className="text-gray-200">{news.created_at ? new Date(news.created_at).toLocaleString('tr-TR') : '-'}</span></p>
                        <p><span className="text-gray-400">Sisteme Giriş:</span> <span className="text-gray-200">{new Date().toLocaleTimeString('tr-TR')}</span></p>
                        {news.verification_sources && news.verification_sources.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-1">Kaynaklar:</span>
                                <div className="flex flex-wrap gap-1">
                                    {news.verification_sources.slice(0, 3).map((s, i) => (
                                        <a key={i} href={s.url} target="_blank" className="text-primary hover:underline truncate max-w-[150px] block bg-primary/10 px-1.5 py-0.5 rounded">{s.url ? s.url.split('/')[2] : 'Link'}</a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-start mb-3">
                    <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border", status.bg, status.color, status.border)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleStar}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isStarred
                                    ? "text-yellow-400 bg-yellow-400/20"
                                    : "text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10"
                            )}
                            title={isStarred ? "Yıldızı Kaldır" : "Yıldızla"}
                        >
                            <Star className={cn("w-4 h-4", isStarred && "fill-yellow-400")} />
                        </button>
                        <span className="text-xs text-gray-500">{news.time}</span>
                        {/* Always show verify button */}
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying || news.status === 'exempt'}
                            className={cn(
                                "p-1.5 rounded transition-colors flex items-center gap-1",
                                news.status === 'pending'
                                    ? "bg-primary/20 hover:bg-primary/30 text-primary"
                                    : news.status === 'exempt'
                                        ? "bg-purple-500/10 text-purple-300 cursor-not-allowed"
                                        : "bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200"
                            )}
                            title={news.status === 'exempt' ? "Astroloji kategorisi teyit dışıdır" : news.status === 'pending' ? "Şimdi Teyit Et" : "Tekrar Teyit Et"}
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isVerifying && "animate-spin")} />
                        </button>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-200 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                </h3>

                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {news.summary}
                </p>

                {/* Improved Content Generation Button */}
                <div className="mt-4 pt-4 border-t border-dark-border/50">
                    <button
                        onClick={handleGenerateContent}
                        disabled={isGenerating}
                        className="w-full text-center text-xs font-bold text-white transition-all py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-size-200 animate-gradient hover:shadow-xl hover:shadow-purple-900/30 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Üretiliyor...
                            </>
                        ) : generatedContent ? (
                            <>
                                <Sparkles className="w-4 h-4" />
                                İçeriği Görüntüle
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Yapay Zeka ile İçerik Üret
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{news.category}</span>
                        <span className="font-medium text-gray-400">{news.source}</span>
                    </div>

                    <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-dark-bg"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Content Modal */}
            {showContentModal && generatedContent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowContentModal(false)}>
                    <div className="bg-dark-card border border-dark-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-dark-border flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                Üretilen İçerik
                            </h2>
                            <button onClick={() => setShowContentModal(false)} className="text-gray-400 hover:text-white p-1">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                            {generatedContent.bolum1 && (
                                <div className="bg-dark-bg/50 p-4 rounded-xl border border-dark-border">
                                    <h3 className="text-purple-400 font-bold text-sm mb-1">BÖLÜM 1: GİRİŞ</h3>
                                    {generatedContent.bolum1.baslik && <h4 className="text-white font-bold mb-2">{generatedContent.bolum1.baslik}</h4>}
                                    <p className="text-gray-300 text-sm">{generatedContent.bolum1.metin}</p>
                                </div>
                            )}
                            {generatedContent.bolum2 && (
                                <div className="bg-dark-bg/50 p-4 rounded-xl border border-dark-border">
                                    <h3 className="text-purple-400 font-bold text-sm mb-1">BÖLÜM 2: GELİŞME</h3>
                                    {generatedContent.bolum2.alt_baslik && <h4 className="text-white font-bold mb-2">{generatedContent.bolum2.alt_baslik}</h4>}
                                    <p className="text-gray-300 text-sm">{generatedContent.bolum2.metin}</p>
                                </div>
                            )}
                            {generatedContent.bolum3 && (
                                <div className="bg-dark-bg/50 p-4 rounded-xl border border-dark-border">
                                    <h3 className="text-purple-400 font-bold text-sm mb-1">BÖLÜM 3: SONUÇ</h3>
                                    {generatedContent.bolum3.alt_baslik && <h4 className="text-white font-bold mb-2">{generatedContent.bolum3.alt_baslik}</h4>}
                                    <p className="text-gray-300 text-sm">{generatedContent.bolum3.metin}</p>
                                </div>
                            )}
                            {generatedContent.analiz && (
                                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
                                    <h3 className="text-purple-400 font-bold text-sm mb-1 flex items-center gap-2">🧠 APERTUS ANALİZİ</h3>
                                    {generatedContent.analiz.baslik && <h4 className="text-white font-bold mb-2">{generatedContent.analiz.baslik}</h4>}
                                    <p className="text-gray-300 text-sm italic">{generatedContent.analiz.metin}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-dark-border flex gap-2">
                            <button
                                onClick={() => {
                                    const text = `${generatedContent.bolum1?.baslik || ''}\n\n${generatedContent.bolum1?.metin || ''}\n\n${generatedContent.bolum2?.metin || ''}\n\n${generatedContent.bolum3?.metin || ''}\n\n${generatedContent.analiz?.metin || ''}`;
                                    navigator.clipboard.writeText(text);
                                    alert('İçerik panoya kopyalandı!');
                                }}
                                className="flex-1 bg-primary hover:bg-primary/90 text-dark-bg font-bold py-2 rounded-lg text-sm"
                            >
                                📋 Kopyala
                            </button>
                            <button
                                onClick={() => navigate('/content-studio', { state: { news: { ...news, generated_content: generatedContent } } })}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm"
                            >
                                ✏️ Stüdyoda Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

