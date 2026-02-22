import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Share2, Save } from 'lucide-react';

function toObjectContent(input) {
    if (!input) return null;
    if (typeof input === 'object') return input;
    try {
        return JSON.parse(input);
    } catch {
        return null;
    }
}

export default function ContentStudioPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [news, setNews] = useState(location.state?.news || null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [socialPost, setSocialPost] = useState(null);
    const [socialLoading, setSocialLoading] = useState(false);
    const [sourceLoading, setSourceLoading] = useState(false);
    const [showFullText, setShowFullText] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (news && news.generated_content) {
            setGeneratedContent(toObjectContent(news.generated_content));
        }
    }, [news]);

    useEffect(() => {
        const hydrateSource = async () => {
            if (!news?.id) return;
            if ((news.full_text || '').trim() || (news.summary || '').trim()) return;

            setSourceLoading(true);
            try {
                const res = await fetch(`/api/v1/content/${news.id}/source`);
                if (res.ok) {
                    const data = await res.json();
                    setNews((prev) => ({
                        ...prev,
                        summary: data.summary || prev?.summary || '',
                        full_text: data.full_text || prev?.full_text || '',
                    }));
                }
            } catch (err) {
                console.error('Source hydrate error:', err);
            } finally {
                setSourceLoading(false);
            }
        };

        hydrateSource();
    }, [news?.id, news?.full_text, news?.summary]);

    const originalText = useMemo(() => {
        if (!news) return '';
        return news.full_text || news.summary || '';
    }, [news]);

    const visibleOriginalText = useMemo(() => {
        if (!originalText) return '';
        if (showFullText || originalText.length < 1600) return originalText;
        return `${originalText.slice(0, 1600)}...`;
    }, [originalText, showFullText]);

    const handleGenerate = async () => {
        if (!news) return;
        setLoading(true);
        setSaveMessage('');
        try {
            const res = await fetch(`/api/v1/news/${news.id}/content`);
            if (res.ok) {
                const content = await res.json();
                if (content && content.bolum1 && content.bolum1.metin) {
                    setGeneratedContent(content);
                    setNews((prev) => ({ ...prev, generated_content: content }));
                } else {
                    alert('Icerik uretilemedi. Daha sonra tekrar deneyin.');
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Icerik uretilemedi: ${errData.detail || res.statusText}`);
            }
        } catch (err) {
            console.error('Generation error:', err);
            alert('Icerik uretimi basarisiz oldu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!news || !generatedContent) return;
        setIsSaving(true);
        setSaveMessage('');
        try {
            const res = await fetch(`/api/v1/content/${news.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ generated_content: generatedContent }),
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.generated_content) {
                    setGeneratedContent(data.generated_content);
                }
                setSaveMessage('Degisiklikler kaydedildi.');
            } else {
                const errData = await res.json().catch(() => ({}));
                setSaveMessage(`Kaydetme hatasi: ${errData.detail || 'Bilinmeyen hata'}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            setSaveMessage('Kaydetme hatasi olustu.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 2500);
        }
    };

    const updateSectionField = (sectionKey, field, value) => {
        setGeneratedContent((prev) => {
            const base = prev ? { ...prev } : {};
            const section = { ...(base[sectionKey] || {}) };
            section[field] = value;
            base[sectionKey] = section;
            return base;
        });
    };

    const updateSeoField = (field, value) => {
        setGeneratedContent((prev) => {
            const base = prev ? { ...prev } : {};
            const seo = { ...(base.seo || {}) };
            seo[field] = value;
            base.seo = seo;
            return base;
        });
    };

    const renderOriginalContent = () => {
        if (!news) return null;
        return (
            <div className="space-y-4 text-gray-300">
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">{news.title}</h3>
                    <p className="text-sm text-gray-400">
                        {news.source} - {news.created_at ? new Date(news.created_at).toLocaleString('tr-TR') : '-'}
                    </p>
                </div>
                <div className="bg-dark-bg/50 p-4 rounded-lg border border-dark-border space-y-3">
                    {sourceLoading ? (
                        <p className="text-sm text-gray-500">Orijinal haber metni yükleniyor...</p>
                    ) : originalText ? (
                        <p className="leading-relaxed whitespace-pre-wrap text-sm">{visibleOriginalText}</p>
                    ) : (
                        <p className="text-sm text-gray-500">Orijinal haber metni bulunamadı.</p>
                    )}
                    {originalText.length > 1600 && !sourceLoading && (
                        <button
                            onClick={() => setShowFullText((prev) => !prev)}
                            className="text-xs text-primary hover:underline"
                        >
                            {showFullText ? 'Daha az goster' : 'Tum metni goster'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderGeneratedSection = (sectionTitle, sectionData, sectionKey) => {
        if (!sectionData) return null;

        return (
            <div className="mb-6 bg-dark-bg/30 p-4 rounded-xl border border-dark-border/50">
                <h4 className="text-primary font-bold mb-2 uppercase text-xs tracking-wider">{sectionTitle}</h4>
                {Object.prototype.hasOwnProperty.call(sectionData, 'baslik') && (
                    <input
                        value={sectionData.baslik || ''}
                        onChange={(e) => updateSectionField(sectionKey, 'baslik', e.target.value)}
                        className="w-full mb-2 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                        placeholder="Baslik"
                    />
                )}
                {Object.prototype.hasOwnProperty.call(sectionData, 'alt_baslik') && (
                    <input
                        value={sectionData.alt_baslik || ''}
                        onChange={(e) => updateSectionField(sectionKey, 'alt_baslik', e.target.value)}
                        className="w-full mb-2 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-gray-300"
                        placeholder="Alt baslik"
                    />
                )}
                <textarea
                    value={sectionData.metin || ''}
                    onChange={(e) => updateSectionField(sectionKey, 'metin', e.target.value)}
                    className="w-full min-h-[150px] bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-pre-wrap"
                    placeholder="Metin"
                />
            </div>
        );
    };

    if (!news) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">Haber secilmedi. Lutfen Istihbarat sayfasindan bir haber secin.</p>
                <button onClick={() => navigate('/verify')} className="mt-4 text-primary hover:underline">
                    Geri Don
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/verify')} className="p-2 hover:bg-dark-bg rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">⚡</span> Icerik Studyosu
                        </h1>
                        <p className="text-xs text-gray-500">AI destekli icerik uretimi ve duzenleme</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-dark-bg px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {generatedContent ? 'Yeniden Uret' : 'Icerik Uret'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !generatedContent}
                        className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Kaydet
                    </button>
                </div>
            </div>

            {saveMessage && <p className="mb-3 text-xs text-emerald-300">{saveMessage}</p>}

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-hidden min-h-0">
                <div className="flex flex-col overflow-hidden bg-dark-card rounded-xl border border-dark-border">
                    <div className="p-3 bg-dark-bg/50 border-b border-dark-border flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Orijinal Kaynak</span>
                        <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        {renderOriginalContent()}
                    </div>
                </div>

                <div className="flex flex-col overflow-hidden bg-dark-card rounded-xl border border-dark-border shadow-lg">
                    <div className="p-3 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
                        <span className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                            <span className="text-lg">✨</span> Apertus Uretimi
                        </span>
                        <button
                            className="text-gray-400 hover:text-white"
                            title="Kopyala"
                            onClick={() => {
                                if (!generatedContent) return;
                                const sections = [generatedContent.bolum1, generatedContent.bolum2, generatedContent.bolum3, generatedContent.analiz]
                                    .filter(Boolean)
                                    .map((section) => `${section.baslik || section.alt_baslik || ''}\n${section.metin || ''}`)
                                    .join('\n\n');
                                navigator.clipboard.writeText(sections);
                            }}
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-2">
                        {!generatedContent || !generatedContent.bolum1 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <span className="text-4xl mb-4">⌨️</span>
                                <p>Icerik uretmek icin butona tiklayin.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-emerald-300 font-bold uppercase text-xs tracking-wider">SEO Skoru</h4>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-emerald-300">{generatedContent?.seo?.score ?? 0}/100</p>
                                            <p className="text-[11px] text-emerald-400/80">Seviye: {generatedContent?.seo?.grade || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 mb-3">
                                        <input
                                            value={generatedContent?.seo?.focus_keyword || ''}
                                            onChange={(e) => updateSeoField('focus_keyword', e.target.value)}
                                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                                            placeholder="Odak anahtar kelime"
                                        />
                                        <input
                                            value={generatedContent?.seo?.meta_title || ''}
                                            onChange={(e) => updateSeoField('meta_title', e.target.value)}
                                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                                            placeholder="Meta title"
                                        />
                                        <textarea
                                            value={generatedContent?.seo?.meta_description || ''}
                                            onChange={(e) => updateSeoField('meta_description', e.target.value)}
                                            rows={3}
                                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                                            placeholder="Meta description"
                                        />
                                    </div>

                                    {Array.isArray(generatedContent?.seo?.recommendations) && generatedContent.seo.recommendations.length > 0 && (
                                        <div className="space-y-1">
                                            {generatedContent.seo.recommendations.slice(0, 3).map((item, idx) => (
                                                <p key={idx} className="text-xs text-amber-300/90">- {item}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {renderGeneratedSection('Bolum 1: Giris', generatedContent.bolum1, 'bolum1')}
                                {renderGeneratedSection('Bolum 2: Gelisme', generatedContent.bolum2, 'bolum2')}
                                {renderGeneratedSection('Bolum 3: Sonuc', generatedContent.bolum3, 'bolum3')}
                                {generatedContent.analiz && renderGeneratedSection('Apertus Analizi', generatedContent.analiz, 'analiz')}

                                <div className="mt-6 bg-blue-500/10 p-5 rounded-xl border border-blue-500/30">
                                    <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-3">
                                        <Share2 className="w-5 h-5" /> Paylasim Metni
                                    </h4>

                                    {!socialPost ? (
                                        <button
                                            onClick={async () => {
                                                setSocialLoading(true);
                                                try {
                                                    const res = await fetch(`/api/v1/content/${news.id}/social`);
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        setSocialPost(data);
                                                    } else {
                                                        const errData = await res.json().catch(() => ({}));
                                                        alert(errData.detail || 'Paylasim metni uretilemedi.');
                                                    }
                                                } catch (e) {
                                                    console.error('Social post error:', e);
                                                    alert('Paylasim metni uretiminde hata olustu.');
                                                } finally {
                                                    setSocialLoading(false);
                                                }
                                            }}
                                            disabled={socialLoading}
                                            className="w-full py-3 border border-dashed border-blue-500/50 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {socialLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            Paylasim Metni Uret
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                value={socialPost.post_text || ''}
                                                onChange={(e) => setSocialPost((prev) => ({ ...prev, post_text: e.target.value }))}
                                                rows={8}
                                                className="w-full min-h-[180px] bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-pre-wrap overflow-y-auto"
                                            />
                                            {/* v0.3.1: Kategorili Hashtag Gösterimi */}
                                            {socialPost.hashtags_categorized ? (
                                                <div className="space-y-2">
                                                    {Object.entries(socialPost.hashtags_categorized).map(([catKey, tags]) => {
                                                        const labels = {
                                                            genis_kitle: '🌐 Geniş Kitle',
                                                            nis_kitle: '🎯 Niş Kitle',
                                                            ingilizce: '🌍 İngilizce',
                                                            marka_lokasyon: '📍 Marka/Lokasyon'
                                                        };
                                                        if (!tags || tags.length === 0) return null;
                                                        return (
                                                            <div key={catKey} className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[10px] text-gray-500 min-w-[100px]">{labels[catKey] || catKey}</span>
                                                                {tags.map((tag, i) => (
                                                                    <span key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {(socialPost.hashtags || []).map((tag, i) => (
                                                        <span key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                            {tag.startsWith('#') ? tag : `#${tag}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const fullText = `${socialPost.post_text || ''}\n\n${(socialPost.hashtags || []).join(' ')}`;
                                                    navigator.clipboard.writeText(fullText);
                                                }}
                                                className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3" /> Kopyala
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
