import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { apiFetch, getFullImageUrl, useApp } from '../../context/AppContext';

export const AdminCategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, showToast } = useApp();
  const isEditing = Boolean(id);
  const existingCategory = isEditing ? categories.find((category) => category.id === id) : null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existingCategory) return;
    setName(existingCategory.name);
    setDescription(existingCategory.description || '');
    setImage(existingCategory.image || '');
  }, [existingCategory]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image must be 10MB or smaller.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Image upload failed.');
      }

      setImage(getFullImageUrl(data.url));
      showToast('Category image uploaded.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2) {
      showToast('Category name must be at least 2 characters', 'error');
      return;
    }

    if (!image) {
      showToast('Upload a category image before saving.', 'error');
      return;
    }

    if (isEditing && id) {
      void updateCategory(id, { name: trimmedName, description: trimmedDescription, image });
      showToast(`Category "${trimmedName}" updated successfully!`, 'success');
    } else {
      addCategory({ name: trimmedName, description: trimmedDescription, image });
    }

    navigate('/admin/categories');
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/categories"
              aria-label="Back to categories"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/categories"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-[#FF0038] px-5 py-2 text-xs font-extrabold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? 'Save Changes' : 'Save Category'}
            </button>
          </div>
        </div>

        <div className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="space-y-1.5">
            <label htmlFor="category-name" className="text-sm font-bold text-slate-800">
              Category Name <span className="text-[#FF0038]">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter category name"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm focus:border-[#FF0038] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category-description" className="text-sm font-bold text-slate-800">
              Description
            </label>
            <textarea
              id="category-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter a short description (optional)"
              className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm focus:border-[#FF0038] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-bold text-slate-800">
              Category Photo <span className="text-[#FF0038]">*</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {image ? (
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-3">
                <img src={image} alt="Category preview" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4" />
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => setImage('')}
                  disabled={isUploading}
                  aria-label="Remove category photo"
                  className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700 transition-colors hover:border-[#FF0038] hover:bg-rose-50/40 disabled:opacity-50"
              >
                <ImageIcon className="h-6 w-6 text-[#FF0038]" />
                <span>{isUploading ? 'Uploading photo...' : 'Choose a category photo'}</span>
                <span className="text-xs font-normal text-slate-500">PNG, JPG, WEBP up to 10MB</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};