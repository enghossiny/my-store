'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type Category = {
  id: string;
  name_en: string;
  name_ar: string;
};

type Props = {
  categories: Category[];
  lang: string;
  totalCount: number;
};

export default function ProductSearch({ categories, lang, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAr = lang === 'ar';

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('min') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') ?? '');

  // Update URL when filters change
  const applyFilters = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    const values = {
      search, category, sort, min: minPrice, max: maxPrice,
      ...overrides,
    };
    Object.entries(values).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => applyFilters({ search }), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategory = (val: string) => {
    setCategory(val);
    applyFilters({ category: val });
  };

  const handleSort = (val: string) => {
    setSort(val);
    applyFilters({ sort: val });
  };

  const handlePriceApply = () => {
    applyFilters({ min: minPrice, max: maxPrice });
  };

  const clearAll = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  };

  const hasFilters = search || category || minPrice || maxPrice || sort !== 'newest';

  const inputStyle = {
    padding: '10px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
  };

  return (
    <div style={{ marginBottom: '2rem' }}>

      {/* Search bar */}
      <div style={{
        position: 'relative',
        marginBottom: '1.25rem',
      }}>
        <span style={{
          position: 'absolute',
          left: isAr ? 'auto' : '14px',
          right: isAr ? '14px' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '18px',
          pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
          style={{
            ...inputStyle,
            width: '100%',
            paddingLeft: isAr ? '14px' : '44px',
            paddingRight: isAr ? '44px' : '14px',
            boxSizing: 'border-box',
            fontSize: '16px',
            boxShadow: '0 4px 20px rgba(108,99,255,0.08)',
            border: '1.5px solid #c4b5fd',
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(''); applyFilters({ search: '' }); }}
            style={{
              position: 'absolute',
              right: isAr ? 'auto' : '14px',
              left: isAr ? '14px' : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#9ca3af',
            }}
          >✕</button>
        )}
      </div>

      {/* Filters row */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCategory('')}
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'inherit',
              background: !category
                ? 'linear-gradient(135deg, #6c63ff, #e91e8c)'
                : '#f3f4f6',
              color: !category ? '#fff' : '#374151',
              boxShadow: !category ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              style={{
                padding: '7px 18px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'inherit',
                background: category === cat.id
                  ? 'linear-gradient(135deg, #6c63ff, #e91e8c)'
                  : '#f3f4f6',
                color: category === cat.id ? '#fff' : '#374151',
                boxShadow: category === cat.id ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isAr ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          style={{
            ...inputStyle,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <option value="newest">{isAr ? 'الأحدث' : 'Newest'}</option>
          <option value="price_asc">{isAr ? 'السعر: الأقل أولاً' : 'Price: Low to High'}</option>
          <option value="price_desc">{isAr ? 'السعر: الأعلى أولاً' : 'Price: High to Low'}</option>
          <option value="name_asc">{isAr ? 'الاسم: أ-ي' : 'Name: A-Z'}</option>
        </select>
      </div>

      {/* Price range */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginTop: '10px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
          {isAr ? 'السعر:' : 'Price:'}
        </span>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder={isAr ? 'من' : 'Min'}
          style={{ ...inputStyle, width: '90px' }}
        />
        <span style={{ color: '#9ca3af' }}>—</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={isAr ? 'إلى' : 'Max'}
          style={{ ...inputStyle, width: '90px' }}
        />
        <button
          onClick={handlePriceApply}
          style={{
            padding: '8px 18px',
            background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'inherit',
          }}
        >
          {isAr ? 'تطبيق' : 'Apply'}
        </button>

        {/* Results count + clear */}
        <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: 'auto' }}>
          {totalCount} {isAr ? 'منتج' : 'products'}
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              padding: '7px 16px',
              background: '#fef2f2',
              color: '#ef4444',
              border: '1px solid #fecaca',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'inherit',
            }}
          >
            {isAr ? 'مسح الكل' : 'Clear all'}
          </button>
        )}
      </div>
    </div>
  );
}