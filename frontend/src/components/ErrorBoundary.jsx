import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-dark-card border border-red-500/20 rounded-2xl p-8 shadow-2xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Oops! Bir Şeyler Ters Gitti.</h2>
                            <p className="text-gray-400 text-sm">
                                Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı yenileyin.
                            </p>

                            <div className="w-full bg-black/40 p-4 rounded-lg text-left overflow-auto max-h-40 border border-gray-800">
                                <p className="text-red-400 font-mono text-xs break-all">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary hover:bg-primary/90 text-dark-bg font-bold px-6 py-2 rounded-lg transition-colors w-full"
                            >
                                Sayfayı Yenile
                            </button>
                            <a href="/" className="text-gray-500 hover:text-gray-300 text-xs">
                                Ana Sayfaya Dön
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
