import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { fetchFAQById, deleteFAQ } from '../services/faqApi';
import { useAuth } from '../context/AuthContext';

const AdminFAQDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [faq, setFaq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFAQ();
    }, [id]);

    const loadFAQ = async () => {
        try {
            setLoading(true);
            const data = await fetchFAQById(id);
            setFaq(data);
        } catch (err) {
            setError('Failed to load FAQ');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${faq.question}"?`)) return;

        try {
            await deleteFAQ(id);
            navigate('/admin/faq');
        } catch (err) {
            alert('Failed to delete FAQ');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto"></div>
            </div>
        );
    }

    if (error || !faq) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600">{error || 'FAQ not found'}</p>
                <button
                    onClick={() => navigate('/admin/faq')}
                    className="mt-4 text-primary-600 hover:text-primary-700"
                >
                    Back to FAQs
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/faq')}
                        className="rounded-full bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">FAQ Details</h1>
                </div>

                {/* Admin Actions */}
                {user?.role === 1 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/admin/faq/edit/${id}`)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* FAQ Content */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div>
                    <h2 className="text-sm font-medium text-slate-500 mb-2">Question</h2>
                    <p className="text-xl font-semibold text-slate-900">{faq.question}</p>
                </div>

                <div>
                    <h2 className="text-sm font-medium text-slate-500 mb-2">Answer</h2>
                    <p className="text-slate-700 whitespace-pre-wrap">{faq.answer}</p>
                </div>

                {faq.tags && (
                    <div>
                        <h2 className="text-sm font-medium text-slate-500 mb-2">Tags</h2>
                        <div className="flex gap-2 flex-wrap">
                            {faq.tags.split(',').map((tag, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">Created:</span>
                            <span className="ml-2 text-slate-900">
                                {new Date(faq.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Updated:</span>
                            <span className="ml-2 text-slate-900">
                                {new Date(faq.updated_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFAQDetail;
