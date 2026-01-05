import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircleQuestion, Plus, Edit, Trash2, Search } from 'lucide-react';
import { fetchFAQs, deleteFAQ } from '../services/faqApi';

const AdminFAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadFAQs();
    }, [searchQuery]);

    const loadFAQs = async () => {
        try {
            setLoading(true);
            const data = await fetchFAQs(searchQuery);
            // Handle both paginated and non-paginated responses
            setFaqs(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error('FAQ load error:', err);
            setFaqs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadFAQs();
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleDelete = async (id, question) => {
        if (!window.confirm(`Are you sure you want to delete "${question}"?`)) return;

        try {
            await deleteFAQ(id);
            setFaqs(faqs.filter(f => f.id !== id));
        } catch (err) {
            alert('Failed to delete FAQ');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MessageCircleQuestion className="h-7 w-7 text-primary-600" />
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">FAQ Management</h1>
                        <p className="text-sm text-slate-500">Manage Frequently Asked Questions</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/faq/new')}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
                >
                    <Plus className="h-4 w-4" />
                    New FAQ
                </button>
            </div>

            {/* Search */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={handleClearSearch}
                            type="button"
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* FAQs List */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto"></div>
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageCircleQuestion className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">
                            {searchQuery ? 'No FAQs found matching your search' : 'No FAQs yet. Create your first one!'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="p-4 hover:bg-slate-50 transition">
                                <div className="flex justify-between gap-4">
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => navigate(`/admin/faq/${faq.id}`)}
                                    >
                                        <h3 className="font-medium text-slate-900 mb-1 hover:text-primary-600 transition">{faq.question}</h3>
                                        <p className="text-sm text-slate-600 line-clamp-2">{faq.answer}</p>
                                        {faq.tags && (
                                            <div className="mt-2 flex gap-2">
                                                {faq.tags.split(',').map((tag, i) => (
                                                    <span key={i} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => navigate(`/admin/faq/edit/${faq.id}`)}
                                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faq.id, faq.question)}
                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFAQManagement;
