
import React, { useState, useMemo } from 'react';
import { KnowledgeBaseArticle } from '../types.ts';

// Simple markdown to HTML renderer for safety. Avoids dangerouslySetInnerHTML with complex libraries for this demo.
const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements = lines.map((line, index) => {
        if (line.startsWith('## ')) {
            return React.createElement('h2', { key: index, className: 'text-2xl font-bold mt-4 mb-2' }, line.substring(3));
        }
        if (line.startsWith('* ')) {
            return React.createElement('li', { key: index, className: 'ml-6 list-disc' }, line.substring(2));
        }
        // Basic bolding **text**
        const boldedLine = line.split('**').map((part, i) => 
            i % 2 === 1 ? React.createElement('strong', { key: i }, part) : part
        );
        return React.createElement('p', { key: index, className: 'my-2' }, ...boldedLine);
    });
    return React.createElement('div', null, ...elements);
};


const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ articles }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(articles[0] || null);

    const filteredArticles = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) return articles;
        return articles.filter(article =>
            article.title.toLowerCase().includes(lowerSearch) ||
            article.content.toLowerCase().includes(lowerSearch) ||
            article.category.toLowerCase().includes(lowerSearch)
        );
    }, [articles, searchTerm]);

    const articlesByCategory = useMemo(() => {
        return filteredArticles.reduce((acc, article) => {
            if (!acc[article.category]) {
                acc[article.category] = [];
            }
            acc[article.category].push(article);
            return acc;
        }, {} as Record<string, KnowledgeBaseArticle[]>);
    }, [filteredArticles]);

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 bg-white p-6 rounded-xl shadow-md flex flex-col">
                <h3 className="text-xl font-semibold text-secondary mb-4">Help Center</h3>
                <div className="relative mb-4">
                    <svg className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    {Object.entries(articlesByCategory).map(([category, articlesInCategory]) => (
                        <div key={category} className="mb-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
                            <ul className="space-y-1">
                                {articlesInCategory.map(article => (
                                    <li key={article.id}>
                                        <button
                                            onClick={() => setSelectedArticle(article)}
                                            className={`w-full text-left p-2 rounded-md text-sm transition-colors ${selectedArticle?.id === article.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100'}`}
                                        >
                                            {article.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {filteredArticles.length === 0 && <p className="text-sm text-gray-500 text-center">No articles found.</p>}
                </div>
            </div>
            <div className="w-2/3 bg-white p-8 rounded-xl shadow-md overflow-y-auto">
                {selectedArticle ? (
                    <article className="prose max-w-none">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold text-secondary">{selectedArticle.title}</h1>
                                <p className="text-sm text-gray-500">
                                    In <span className="font-semibold">{selectedArticle.category}</span> &middot; Last updated on {new Date(selectedArticle.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                             <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{selectedArticle.status}</span>
                        </div>
                        <div className="border-t my-6"></div>
                        <div>
                            {renderMarkdown(selectedArticle.content)}
                        </div>
                    </article>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            <h3 className="text-lg font-semibold">Select an article</h3>
                            <p>Choose an article from the list to view its content.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeBasePage;
