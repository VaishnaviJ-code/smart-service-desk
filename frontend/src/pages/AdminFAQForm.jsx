import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchFAQById, createFAQ, updateFAQ } from '../services/faqApi';

const AdminFAQForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        tags: '',
    });
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            loadFAQ();
        }
    }, [id]);

    const loadFAQ = async () => {
        try {
            const data = await fetchFAQById(id);
            setFormData({
                question: data.question,
                answer: data.answer,
                tags: data.tags || '',
            });
        } catch (err) {
            setError('Failed to load FAQ');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (isEditMode) {
                await updateFAQ(id, formData);
            } else {
                await createFAQ(formData);
            }
            navigate('/admin/faq');
        } catch (err) {
            setError('Failed to save FAQ');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/faq')}
                    className="rounded-full bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? 'Edit FAQ' : 'Create New FAQ'}
                </h1>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Question <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="e.g., How do I reset my password?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Answer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        rows={6}
                        value={formData.answer}
                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Enter the answer here..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tags
                    </label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="e.g., account, password, security (comma separated)"
                    />
                    <p className="mt-1 text-xs text-slate-500">Separate tags with commas</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/faq')}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save FAQ'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminFAQForm;
