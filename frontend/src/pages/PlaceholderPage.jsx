export default function PlaceholderPage({ title, message }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center border border-dark-border mb-4">
                <span className="text-2xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
            <p className="text-gray-400 max-w-md">
                {message || "Bu özellik şu anda geliştirme aşamasındadır. Yakında hizmetinizde olacak."}
            </p>
        </div>
    );
}
