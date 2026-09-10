import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  X, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Info,
  Star,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  Sliders,
  CheckCircle2,
  Package
} from 'lucide-react';
import { useApp, apiFetch, getFullImageUrl } from '../../context/AppContext';
import { CategoryId, Product, PaperFinish, ProductSize } from '../../types';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, categories, showToast } = useApp();

  const isEditing = Boolean(id);
  const existingProduct = isEditing ? products.find((p) => p.id === id) : null;

  // Active sub-tab in form for clean organization
  const [activeSection, setActiveSection] = useState<'details' | 'finishes' | 'sizes' | 'pricing'>('details');

  // Form State
  const [name, setName] = useState(existingProduct?.name || '');
  const [nameMr, setNameMr] = useState(existingProduct?.nameMr || '');
  const [tagline, setTagline] = useState(existingProduct?.tagline || '');
  const [badge, setBadge] = useState(existingProduct?.badge || 'PRO PRINT BESTSELLER');
  const [unit, setUnit] = useState(existingProduct?.unit || 'pcs');

  const [categoryId, setCategoryId] = useState<CategoryId>(() => {
    if (existingProduct?.categoryId) return existingProduct.categoryId;
    return categories.length > 0 ? categories[0].id : '';
  });

  const [price, setPrice] = useState<string>(
    existingProduct ? existingProduct.basePrice.toString() : '299'
  );
  const [originalPrice, setOriginalPrice] = useState<string>(
    existingProduct?.originalPrice ? existingProduct.originalPrice.toString() : '399'
  );
  const [singlePrice, setSinglePrice] = useState<string>(
    existingProduct?.singlePrice !== undefined ? existingProduct.singlePrice.toString() : ''
  );
  const [bulkPrice100, setBulkPrice100] = useState<string>(
    existingProduct?.bulkPrice100 !== undefined ? existingProduct.bulkPrice100.toString() : ''
  );
  const [bulkPrice500, setBulkPrice500] = useState<string>(
    existingProduct?.bulkPrice500 !== undefined ? existingProduct.bulkPrice500.toString() : ''
  );
  const [bulkPrice1000, setBulkPrice1000] = useState<string>(
    existingProduct?.bulkPrice1000 !== undefined ? existingProduct.bulkPrice1000.toString() : ''
  );
  const [isBestSeller, setIsBestSeller] = useState<boolean>(
    existingProduct?.isBestSeller ?? true
  );
  const [minQty, setMinQty] = useState<string>(
    existingProduct ? existingProduct.minQuantity?.toString() || '10' : '10'
  );
  const [defaultQty, setDefaultQty] = useState<string>(
    existingProduct ? existingProduct.defaultQuantity?.toString() || '25' : '25'
  );
  const [quantityOptionsStr, setQuantityOptionsStr] = useState<string>(
    existingProduct?.quantityOptions && existingProduct.quantityOptions.length > 0
      ? existingProduct.quantityOptions.join(', ')
      : '10, 25, 50, 100, 250, 500, 1000'
  );

  const [turnaround, setTurnaround] = useState<string>(
    existingProduct?.specifications?.['Turnaround'] || '24-48 Hours'
  );
  const [description, setDescription] = useState(
    existingProduct?.description ||
      'Heidelberg 4-color offset press fidelity with European high-density board.'
  );
  const [tags, setTags] = useState<string[]>(
    existingProduct?.tags || ['Offset', 'Premium', 'Fast Dispatch']
  );
  const [newTagInput, setNewTagInput] = useState('');

  // Features List
  const [features, setFeatures] = useState<string[]>(
    existingProduct?.features && existingProduct.features.length > 0
      ? existingProduct.features
      : [
          'Heidelberg 4-Color Precision Offset Printing',
          'Premium substrate with scratch-resistant coating',
          'Fast turnaround with express safe dispatch'
        ]
  );
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Paper Stocks & Finishes Editor
  const [finishes, setFinishes] = useState<PaperFinish[]>(
    existingProduct?.finishes && existingProduct.finishes.length > 0
      ? existingProduct.finishes
      : [
          {
            id: 'finish-1',
            name: 'Gloss Waterproof Vinyl',
            gsm: '120 Micron',
            description: 'Weatherproof, UV-resistant permanent adhesive gloss vinyl',
            priceMultiplier: 1.0
          },
          {
            id: 'finish-2',
            name: 'Silk Matte Vinyl',
            gsm: '120 Micron',
            description: 'Luxury non-glare smooth finish',
            priceMultiplier: 1.1
          }
        ]
  );

  // Dimensions & Sizes Editor
  const [sizes, setSizes] = useState<ProductSize[]>(
    existingProduct?.sizes && existingProduct.sizes.length > 0
      ? existingProduct.sizes
      : [
          {
            id: 'size-1',
            name: '12" x 18" Full Sheet (305 x 457 mm)',
            dimension: '12x18 inch Sheet',
            priceMultiplier: 1.0
          },
          {
            id: 'size-2',
            name: '13" x 19" Super A3 Sheet',
            dimension: '13x19 inch Sheet',
            priceMultiplier: 1.2
          }
        ]
  );

  // Uploaded Images State & URL Adder
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    { name: string; size: string; progress: number; preview: string }[]
  >(() => {
    if (existingProduct) {
      const allImgs = [
        existingProduct.image,
        ...(existingProduct.galleryImages || [])
      ].filter((img) => img && !img.includes('1618005182384-a83a8bd57fbe'));
      const unique = Array.from(new Set(allImgs));
      if (unique.length > 0) {
        return unique.map((url, idx) => ({
          name: idx === 0 ? 'Main_Cover_Photo.png' : `Gallery_Photo_0${idx + 1}.png`,
          size: 'Verified Asset',
          progress: 100,
          preview: url
        }));
      }
    }
    return [
      {
        name: 'Cover_Photo.png',
        size: 'Primary Mockup',
        progress: 100,
        preview: 'https://i.pinimg.com/1200x/72/c7/ec/72c7ec157835f3350324004879afa7b2.jpg'
      }
    ];
  });

  useEffect(() => {
    if (isEditing && existingProduct) {
      setName(existingProduct.name);
      setNameMr(existingProduct.nameMr || '');
      setCategoryId(existingProduct.categoryId);
      setTagline(existingProduct.tagline || '');
      setBadge(existingProduct.badge || 'PRO PRINT BESTSELLER');
      setUnit(existingProduct.unit || 'pcs');
      setPrice(existingProduct.basePrice.toString());
      setOriginalPrice(existingProduct.originalPrice ? existingProduct.originalPrice.toString() : Math.round(existingProduct.basePrice * 1.3).toString());
      setSinglePrice(existingProduct.singlePrice !== undefined ? existingProduct.singlePrice.toString() : '');
      setBulkPrice100(existingProduct.bulkPrice100 !== undefined ? existingProduct.bulkPrice100.toString() : '');
      setBulkPrice500(existingProduct.bulkPrice500 !== undefined ? existingProduct.bulkPrice500.toString() : '');
      setBulkPrice1000(existingProduct.bulkPrice1000 !== undefined ? existingProduct.bulkPrice1000.toString() : '');
      setIsBestSeller(existingProduct.isBestSeller ?? true);
      setMinQty(existingProduct.minQuantity ? existingProduct.minQuantity.toString() : '10');
      setDefaultQty(existingProduct.defaultQuantity ? existingProduct.defaultQuantity.toString() : '25');
      setQuantityOptionsStr(
        existingProduct.quantityOptions && existingProduct.quantityOptions.length > 0
          ? existingProduct.quantityOptions.join(', ')
          : '10, 25, 50, 100, 250, 500, 1000'
      );
      setDescription(existingProduct.description || '');
      setTags(existingProduct.tags || ['Offset', 'Premium']);
      if (existingProduct.specifications?.['Turnaround']) {
        setTurnaround(existingProduct.specifications['Turnaround']);
      }
      if (existingProduct.features && existingProduct.features.length > 0) {
        setFeatures(existingProduct.features);
      }
      if (existingProduct.finishes && existingProduct.finishes.length > 0) {
        setFinishes(existingProduct.finishes);
      }
      if (existingProduct.sizes && existingProduct.sizes.length > 0) {
        setSizes(existingProduct.sizes);
      }

      // Load all images without omitting gallery
      const rawGallery = [
        existingProduct.image,
        ...(existingProduct.galleryImages || [])
      ].filter((img) => img && !img.includes('1618005182384-a83a8bd57fbe'));
      const unique = Array.from(new Set(rawGallery));
      if (unique.length > 0) {
        setUploadedImages(
          unique.map((url, idx) => ({
            name: idx === 0 ? 'Main_Cover_Photo.png' : `Gallery_Photo_0${idx + 1}.png`,
            size: 'Verified Asset',
            progress: 100,
            preview: url
          }))
        );
      }
    } else if (!isEditing && categories.length > 0) {
      if (!categoryId || !categories.some((c) => c.id === categoryId)) {
        setCategoryId(categories[0].id);
      }
    }
  }, [isEditing, existingProduct]);

  // Handle native file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiFetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setUploadedImages((prev) => [
            ...prev,
            {
              name: file.name,
              size: `${(file.size / 1024).toFixed(0)} KB`,
              progress: 100,
              preview: getFullImageUrl(data.url || data.file?.url)
            }
          ]);
          successCount++;
        }
      } catch (err: any) {
        console.error('File upload error:', err);
      }
    }

    setIsUploadingImage(false);
    if (successCount > 0) {
      showToast(`${successCount} photo(s) uploaded successfully!`, 'success');
    } else {
      showToast('Failed to upload image. Please check file format.', 'error');
    }
  };

  // Handle adding image via URL
  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      showToast('Please enter a valid URL starting with http://, https://, or /', 'error');
      return;
    }
    setUploadedImages((prev) => [
      ...prev,
      {
        name: `Photo_Link_${prev.length + 1}.png`,
        size: 'Remote URL',
        progress: 100,
        preview: trimmed
      }
    ]);
    setImageUrlInput('');
    showToast('Photo added to gallery!', 'success');
  };

  // Reorder / set image as cover
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
    showToast('Selected photo is now the main cover!', 'info');
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= uploadedImages.length) return;
    setUploadedImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleRemoveImage = (index: number) => {
    if (uploadedImages.length <= 1) {
      showToast('Product must have at least one photo.', 'info');
      return;
    }
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  // Quick preset photos
  const handleLoadPresetImages = (type: 'stickers' | 'cards' | 'boxes' | 'files') => {
    if (type === 'stickers') {
      setUploadedImages([
        {
          name: 'Sticker_Sheet_DieCut_12x18.png',
          size: 'High-Res',
          progress: 100,
          preview: 'https://i.pinimg.com/1200x/72/c7/ec/72c7ec157835f3350324004879afa7b2.jpg'
        },
        {
          name: 'Sticker_Showcase_Sample.png',
          size: 'Real Photo',
          progress: 100,
          preview: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=900&q=80'
        },
        {
          name: 'Sticker_Peel_Quality.png',
          size: 'Close-Up',
          progress: 100,
          preview: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80'
        }
      ]);
    } else if (type === 'cards') {
      setUploadedImages([
        {
          name: 'Luxury_Card_Mockup.png',
          size: 'High-Res',
          progress: 100,
          preview: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Embossed_Gold_Foil.png',
          size: 'Detail Shot',
          progress: 100,
          preview: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
        }
      ]);
    } else if (type === 'boxes') {
      setUploadedImages([
        {
          name: 'Rigid_Packaging_Box.png',
          size: 'High-Res',
          progress: 100,
          preview: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
        }
      ]);
    } else {
      setUploadedImages([
        {
          name: 'Project_Office_File.png',
          size: 'High-Res',
          progress: 100,
          preview: 'https://i.pinimg.com/736x/55/d7/5b/55d75bcfad0da6b4df44d19c9fe953b8.jpg'
        }
      ]);
    }
    showToast(`Loaded sample photos for ${type}`, 'info');
  };

  // Tags & Features handlers
  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddFeature = () => {
    if (newFeatureInput.trim() && !features.includes(newFeatureInput.trim())) {
      setFeatures([...features, newFeatureInput.trim()]);
      setNewFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Finishes Handlers
  const handleAddFinish = () => {
    const newFinish: PaperFinish = {
      id: `finish-${Date.now()}`,
      name: 'New Custom Paper / Finish',
      gsm: '300 GSM',
      description: 'Ultra-smooth European imported board',
      priceMultiplier: 1.0
    };
    setFinishes([...finishes, newFinish]);
  };

  const handleUpdateFinish = (index: number, key: keyof PaperFinish, val: any) => {
    setFinishes((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: val } : f))
    );
  };

  const handleRemoveFinish = (index: number) => {
    if (finishes.length <= 1) {
      showToast('Product must have at least one paper stock / finish.', 'info');
      return;
    }
    setFinishes(finishes.filter((_, i) => i !== index));
  };

  // Sizes Handlers
  const handleAddSize = () => {
    const newSize: ProductSize = {
      id: `size-${Date.now()}`,
      name: 'Custom Dimension',
      dimension: 'Custom mm / inches',
      priceMultiplier: 1.0
    };
    setSizes([...sizes, newSize]);
  };

  const handleUpdateSize = (index: number, key: keyof ProductSize, val: any) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: val } : s))
    );
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length <= 1) {
      showToast('Product must have at least one size.', 'info');
      return;
    }
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 3) {
      showToast('Validation Error: Product name must be at least 3 characters', 'error');
      return;
    }

    if (!categoryId) {
      showToast('Validation Error: Please select a valid Category', 'error');
      return;
    }

    const basePriceNum = parseFloat(price);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      showToast('Validation Error: Base Price must be a valid positive number', 'error');
      return;
    }

    const minQtyNum = parseInt(minQty);
    if (isNaN(minQtyNum) || minQtyNum <= 0) {
      showToast('Validation Error: Minimum quantity must be a positive integer', 'error');
      return;
    }

    const defaultQtyNum = parseInt(defaultQty) || minQtyNum;

    if (uploadedImages.length === 0) {
      showToast('Validation Error: Please upload at least one product photo', 'error');
      return;
    }

    const mainImage = uploadedImages[0].preview;
    const galleryImages = uploadedImages.map((img) => img.preview);

    const parsedQtyOptions = quantityOptionsStr
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    const singlePriceNum = singlePrice.trim() ? parseFloat(singlePrice) : undefined;
    const bulkPrice100Num = bulkPrice100.trim() ? parseFloat(bulkPrice100) : undefined;
    const bulkPrice500Num = bulkPrice500.trim() ? parseFloat(bulkPrice500) : undefined;
    const bulkPrice1000Num = bulkPrice1000.trim() ? parseFloat(bulkPrice1000) : undefined;
    const originalPriceNum = originalPrice.trim() ? parseFloat(originalPrice) : Math.round(basePriceNum * 1.3);

    const productPayload: Partial<Product> = {
      name: name.trim(),
      nameMr: nameMr.trim() || undefined,
      categoryId,
      tagline: tagline.trim() || undefined,
      badge: badge.trim() || undefined,
      unit: unit.trim() || 'pcs',
      basePrice: Math.round(basePriceNum),
      originalPrice: originalPriceNum,
      singlePrice: singlePriceNum,
      bulkPrice100: bulkPrice100Num,
      bulkPrice500: bulkPrice500Num,
      bulkPrice1000: bulkPrice1000Num,
      isBestSeller,
      isPopular: true,
      minQuantity: minQtyNum,
      defaultQuantity: defaultQtyNum,
      quantityOptions: parsedQtyOptions.length > 0 ? parsedQtyOptions : [10, 25, 50, 100, 250, 500, 1000],
      description: description.trim(),
      tags,
      image: mainImage,
      galleryImages,
      features,
      finishes,
      sizes,
      specifications: {
        ...(existingProduct?.specifications || {}),
        'Turnaround': turnaround,
        'Stock / Subcategory': finishes[0]?.name || 'Commercial Press Stock'
      }
    };

    if (isEditing && existingProduct) {
      updateProduct(existingProduct.id, productPayload);
      showToast(`Product "${name}" updated with real photos & specs!`, 'success');
      navigate(`/product/${existingProduct.id}`);
    } else {
      addProduct({
        ...productPayload,
        rating: 5.0,
        reviewsCount: 1,
      } as any);
      showToast(`New Product "${name}" published successfully!`, 'success');
      navigate('/admin/products');
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* Top Header with Back Navigation & Live Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isEditing ? `Edit Product: ${existingProduct?.name}` : 'Add New Product'}
              </h2>
              {isEditing && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                  Live in Store
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Upload high-resolution real product photos, configure paper finishes, sizes, and pricing tiers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isEditing && (
            <Link
              to={`/product/${existingProduct?.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Product Page</span>
            </Link>
          )}
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#FF0038] hover:bg-rose-600 active:scale-98 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save Changes & Update Store' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: REAL PRODUCT PHOTOS & GALLERY (lg:col-span-5) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-black text-slate-900 block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FF0038]" />
                  <span>Real Product Photos</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  First photo is the <strong>Cover Display</strong>. Drag or use buttons to reorder.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                {uploadedImages.length} Photo{uploadedImages.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Quick Sample Photos */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
              <span className="text-slate-400 font-semibold px-1">Presets:</span>
              <button
                type="button"
                onClick={() => handleLoadPresetImages('stickers')}
                className="px-2 py-0.5 bg-white hover:bg-rose-50 text-[#FF0038] border border-rose-200 rounded-md font-bold transition-colors cursor-pointer"
              >
                + Sticker Mockups
              </button>
              <button
                type="button"
                onClick={() => handleLoadPresetImages('cards')}
                className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold transition-colors cursor-pointer"
              >
                + Card Mockups
              </button>
              <button
                type="button"
                onClick={() => handleLoadPresetImages('boxes')}
                className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold transition-colors cursor-pointer"
              >
                + Box Mockups
              </button>
              <button
                type="button"
                onClick={() => handleLoadPresetImages('files')}
                className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold transition-colors cursor-pointer"
              >
                + File Mockups
              </button>
            </div>

            {/* File Upload Zone */}
            <label className="border-2 border-dashed border-rose-300/80 bg-rose-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 hover:bg-rose-50/60 transition-all cursor-pointer group block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-[#FF0038] group-hover:scale-110 transition-transform shadow-xs">
                {isUploadingImage ? (
                  <div className="w-6 h-6 border-2 border-[#FF0038] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-extrabold text-slate-900">
                  {isUploadingImage ? 'Saving photo to press server...' : 'Click to Upload Photos'}
                </span>
                <span className="text-[#FF0038] font-bold"> from your phone or PC</span>
              </div>
              <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP (Multiple files allowed)</p>
            </label>

            {/* Direct Image URL Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                Or Paste Image Link / CDN URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF0038]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  + Add URL
                </button>
              </div>
            </div>

            {/* Uploaded Images List with Cover Badge and Action Controls */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Current Photos in Showcase:
              </span>
              
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {uploadedImages.map((img, idx) => {
                  const isCover = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-xs ${
                        isCover
                          ? 'border-[#FF0038] bg-rose-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img
                          src={img.preview}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        {isCover && (
                          <div className="absolute top-0 right-0 bg-[#FF0038] text-white p-0.5 rounded-bl-lg">
                            <Star className="w-3 h-3 fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Info & Badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate text-[11px]">
                            {img.name}
                          </span>
                          {isCover && (
                            <span className="px-2 py-0.5 bg-[#FF0038] text-white rounded-full text-[9px] font-black uppercase tracking-wider shrink-0">
                              Cover Photo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {img.preview.length > 40 ? `${img.preview.slice(0, 40)}...` : img.preview}
                        </p>

                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="text-[10px] font-bold text-[#FF0038] hover:underline mt-1 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>Set as Primary Cover</span>
                          </button>
                        )}
                      </div>

                      {/* Controls: Move Up, Move Down, Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move photo up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'down')}
                          disabled={idx === uploadedImages.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move photo down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & PRICING (7 cols)    */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSection('details')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeSection === 'details'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Title & Details
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('finishes')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSection === 'finishes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#FF0038]" />
              <span>2. Paper & Finishes ({finishes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sizes')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSection === 'sizes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>3. Sizes ({sizes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('pricing')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSection === 'pricing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>4. Pricing & Bulk</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            
            {/* SECTION 1: TITLE & DETAILS */}
            {activeSection === 'details' && (
              <div className="space-y-4 text-xs">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block">
                    Product Name (English) <span className="text-[#FF0038]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12x18 Custom Shape Die Cut Sticker Sheet (₹79/Sheet)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 font-semibold focus:outline-none"
                  />
                </div>

                {/* Marathi Name Translation (Optional) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Product Name (Marathi Translation)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. १२x१८ सानुकूल आकाराचे स्टिकर शीट (₹७९/शीट)"
                    value={nameMr}
                    onChange={(e) => setNameMr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Tagline / Subtitle */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Product Tagline / Short Benefit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vibrant waterproof kiss-cut vinyl sticker sheets with custom shape contouring"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Category & Unit in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-900 block">
                      Category <span className="text-[#FF0038]">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.nameMr ? `(${c.nameMr})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-900 block">
                      Unit of Measure
                    </label>
                    <input
                      type="text"
                      placeholder="sheet, pcs, cards, boxes, books"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Badge and Turnaround */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Display Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. PRO PRINT BESTSELLER, Best Value, 24h Express"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Turnaround / Dispatch</label>
                    <input
                      type="text"
                      placeholder="e.g. 24-48 Hours / 1-Day Express"
                      value={turnaround}
                      onChange={(e) => setTurnaround(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block">Full Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed printing specifications, paper texture, waterproof attributes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none resize-none"
                  />
                </div>

                {/* Key Bullet Features */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 block">
                      Key Bullet Features ({features.length})
                    </label>
                  </div>
                  
                  <div className="space-y-1.5">
                    {features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="flex-1 text-slate-800 text-[11px] font-medium">{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(fIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="+ Add key feature bullet..."
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF0038]"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Add Bullet
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-900 block">Search Tags</label>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF0038] text-white font-bold text-[11px] shadow-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-200 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      placeholder="+ Add Tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] w-24 focus:outline-none focus:border-[#FF0038]"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 2: PAPER STOCKS & FINISHES */}
            {activeSection === 'finishes' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Paper Stock & Finish Options</h3>
                    <p className="text-[11px] text-slate-500">
                      Customers will choose between these paper types and finish textures on the product page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFinish}
                    className="px-3 py-1.5 bg-[#FF0038] text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-rose-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Finish</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {finishes.map((fin, fIdx) => (
                    <div
                      key={fin.id || fIdx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-rose-100 text-[#FF0038] flex items-center justify-center font-black text-[10px]">
                            {fIdx + 1}
                          </span>
                          <span>{fin.name || 'Untitled Finish'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFinish(fIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove finish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">Finish / Stock Name</label>
                          <input
                            type="text"
                            value={fin.name}
                            onChange={(e) => handleUpdateFinish(fIdx, 'name', e.target.value)}
                            placeholder="e.g. Gloss Waterproof Vinyl (₹79/sheet)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#FF0038]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">Thickness / GSM</label>
                          <input
                            type="text"
                            value={fin.gsm || ''}
                            onChange={(e) => handleUpdateFinish(fIdx, 'gsm', e.target.value)}
                            placeholder="e.g. 120 Micron or 350 GSM"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#FF0038]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">Short Description</label>
                          <input
                            type="text"
                            value={fin.description || ''}
                            onChange={(e) => handleUpdateFinish(fIdx, 'description', e.target.value)}
                            placeholder="e.g. Weatherproof, UV-resistant permanent adhesive gloss vinyl"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#FF0038]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">Price Multiplier</label>
                          <input
                            type="number"
                            step="0.05"
                            value={fin.priceMultiplier ?? 1.0}
                            onChange={(e) => handleUpdateFinish(fIdx, 'priceMultiplier', parseFloat(e.target.value) || 1.0)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#FF0038]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: SIZES & DIMENSIONS */}
            {activeSection === 'sizes' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Product Dimensions & Sheet Sizes</h3>
                    <p className="text-[11px] text-slate-500">
                      Configure selectable sizes (e.g. 12x18 in Sheet, 13x19 in Sheet, A4, Custom Box).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 bg-[#FF0038] text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-rose-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {sizes.map((sz, sIdx) => (
                    <div
                      key={sz.id || sIdx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-black text-[10px]">
                            {sIdx + 1}
                          </span>
                          <span>{sz.name || 'Untitled Size'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(sIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">Display Name</label>
                          <input
                            type="text"
                            value={sz.name}
                            onChange={(e) => handleUpdateSize(sIdx, 'name', e.target.value)}
                            placeholder="e.g. 12x18 Full Sheet (305 x 457 mm)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#FF0038]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">Dimension Code</label>
                          <input
                            type="text"
                            value={sz.dimension || ''}
                            onChange={(e) => handleUpdateSize(sIdx, 'dimension', e.target.value)}
                            placeholder="e.g. 12x18 inch Sheet"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#FF0038]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:w-1/3">
                        <label className="text-[11px] font-bold text-slate-700 block">Price Multiplier</label>
                        <input
                          type="number"
                          step="0.05"
                          value={sz.priceMultiplier ?? 1.0}
                          onChange={(e) => handleUpdateSize(sIdx, 'priceMultiplier', parseFloat(e.target.value) || 1.0)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#FF0038]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: PRICING, DISCOUNTS & QUANTITY TIERS */}
            {activeSection === 'pricing' && (
              <div className="space-y-5 text-xs">
                
                {/* Base & MRP Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-900 block">Base Price (₹) <span className="text-[#FF0038]">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="79"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none font-black text-sm"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Starting price per {unit || 'unit'}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Original MRP (₹) (For Strikethrough Discount)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        placeholder="120"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {originalPrice && price && parseFloat(originalPrice) > parseFloat(price) 
                        ? `${Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}% Discount Displayed`
                        : 'Shown as strikethrough MRP'}
                    </span>
                  </div>
                </div>

                {/* Quantities: Min, Default, and Options List */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="font-extrabold text-slate-900 text-xs block">
                    Quantity Selection Configuration
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Min Order Quantity ({unit})</label>
                      <input
                        type="number"
                        required
                        placeholder="10"
                        value={minQty}
                        onChange={(e) => setMinQty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF0038]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Default Selected Quantity ({unit})</label>
                      <input
                        type="number"
                        placeholder="25"
                        value={defaultQty}
                        onChange={(e) => setDefaultQty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF0038]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Quantity Options (Comma Separated Tiers)
                    </label>
                    <input
                      type="text"
                      placeholder="10, 25, 50, 100, 250, 500, 1000"
                      value={quantityOptionsStr}
                      onChange={(e) => setQuantityOptionsStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF0038]"
                    />
                    <p className="text-[10px] text-slate-400">
                      These exact tiers will appear in the "Select Quantity" buttons on the product page.
                    </p>
                  </div>
                </div>

                {/* Single Unit & Bulk Quantity Tier Pricing Strategy */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF0038]" />
                      Single Piece & Bulk Tier Exact Pricing
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Fixed rates applied automatically when a customer picks 1, 100, 500, or 1000 units.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Single Unit (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 79"
                          value={singlePrice}
                          onChange={(e) => setSinglePrice(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">Sample/1 piece</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">100 Qty Total (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 350"
                          value={bulkPrice100}
                          onChange={(e) => setBulkPrice100(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Applied at 100 qty</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">500 Qty Total (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 1200"
                          value={bulkPrice500}
                          onChange={(e) => setBulkPrice500(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Applied at 500 qty</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">1,000 Qty Total (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 1999"
                          value={bulkPrice1000}
                          onChange={(e) => setBulkPrice1000(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-[#FF0038] text-xs text-slate-900 focus:outline-none font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Applied at 1000+ qty</span>
                    </div>
                  </div>
                </div>

                {/* Best Seller Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                      ⭐ Mark as Best Selling Product
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Highlight with BESTSELLER badge and prioritize in homepage & category grids.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0038]"></div>
                  </label>
                </div>

              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeSection !== 'details' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSection === 'finishes') setActiveSection('details');
                      if (activeSection === 'sizes') setActiveSection('finishes');
                      if (activeSection === 'pricing') setActiveSection('sizes');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                )}
                {activeSection !== 'pricing' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSection === 'details') setActiveSection('finishes');
                      if (activeSection === 'finishes') setActiveSection('sizes');
                      if (activeSection === 'sizes') setActiveSection('pricing');
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Next Tab →
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#FF0038] hover:bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-98 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes & Update Store' : 'Publish Product'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
