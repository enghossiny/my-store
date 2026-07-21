'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, supabase } from '@/lib/supabase';

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  region_id: string | null;
  region_name_en: string | null;
  region_name_ar: string | null;
  delivery_fee: number;
  is_default: boolean;
};

type Region = {
  id: string;
  name_en: string;
  name_ar: string;
  delivery_fee: number;
};

type Props = {
  lang: string;
  onSelect: (addr: Address) => void;
  selectedId: string | null;
};

export default function SavedAddresses({ lang, onSelect, selectedId }: Props) {
  const isAr = lang === 'ar';
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    label: 'Home', name: '', phone: '',
    address: '', region_id: '',
  });

  useEffect(() => {
    loadAddresses();
    loadRegions();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    const user = await getCurrentUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('auth_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    setAddresses(data ?? []);

    // Auto-select default address
    const defaultAddr = data?.find(a => a.is_default) ?? data?.[0];
    if (defaultAddr) onSelect(defaultAddr);

    setLoading(false);
  };

  const loadRegions = async () => {
    const { data } = await supabase
      .from('delivery_regions')
      .select('*')
      .eq('active', true)
      .order('delivery_fee', { ascending: true });
    setRegions(data ?? []);
  };

  const handleSaveAddress = async () => {
    if (!newAddr.name || !newAddr.phone || !newAddr.address || !newAddr.region_id) return;

    setSaving(true);
    const user = await getCurrentUser();
    if (!user) { setSaving(false); return; }

    const region = regions.find(r => r.id === newAddr.region_id);

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({
        auth_id: user.id,
        label: newAddr.label,
        name: newAddr.name,
        phone: newAddr.phone,
        address: newAddr.address,
        region_id: newAddr.region_id,
        region_name_en: region?.name_en ?? '',
        region_name_ar: region?.name_ar ?? '',
        delivery_fee: region?.delivery_fee ?? 0,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (!error && data) {
      setAddresses(prev => [data, ...prev]);
      onSelect(data);
      setShowAddForm(false);
      setNewAddr({ label: 'Home', name: '', phone: '', address: '', region_id: '' });
    }
    setSaving(false);
  };

  const handleSetDefault = async (id: string) => {
    const user = await getCurrentUser();
    if (!user) return;

    // Remove default from all
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('auth_id', user.id);

    // Set new default
    await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', id);

    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'حذف هذا العنوان؟' : 'Delete this address?')) return;
    setDeleting(id);
    await supabase.from('customer_addresses').delete().eq('id', id);
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    if (selectedId === id && updated.length > 0) onSelect(updated[0]);
    setDeleting(null);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none', background: '#fff',
  };

  const labelOptions = ['Home', 'Work', 'Family', 'Other'];

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
        {isAr ? 'جاري تحميل العناوين...' : 'Loading addresses...'}
      </div>
    );
  }

  return (
    <div>
      {/* Existing addresses */}
      {addresses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => onSelect(addr)}
              style={{
                padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                border: selectedId === addr.id ? '2px solid #6c63ff' : '1.5px solid #e5e7eb',
                background: selectedId === addr.id ? '#f8f7ff' : '#fff',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {/* Radio + label */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '999px', flexShrink: 0,
                  border: selectedId === addr.id ? '6px solid #6c63ff' : '2px solid #d1d5db',
                  transition: 'all 0.2s', marginTop: '2px',
                }} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: '700', padding: '2px 10px',
                      borderRadius: '999px',
                      background: selectedId === addr.id ? '#6c63ff' : '#f3f4f6',
                      color: selectedId === addr.id ? '#fff' : '#374151',
                    }}>
                      {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '💼' : addr.label === 'Family' ? '👨‍👩‍👧' : '📍'} {addr.label}
                    </span>
                    {addr.is_default && (
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                        borderRadius: '999px', background: '#fef9c3', color: '#854d0e',
                      }}>
                        ⭐ {isAr ? 'الافتراضي' : 'Default'}
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '14px', color: '#1a1a2e' }}>
                    {addr.name} — {addr.phone}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>
                    {addr.address}
                  </p>
                  {addr.region_name_en && (
                    <p style={{ margin: 0, fontSize: '13px', color: '#6c63ff', fontWeight: '600' }}>
                      🚚 {isAr ? addr.region_name_ar : addr.region_name_en} — EGP {addr.delivery_fee}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex', gap: '6px', marginTop: '10px',
                paddingTop: '10px', borderTop: '1px solid #f3f4f6',
              }}>
                {!addr.is_default && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                    style={{
                      padding: '4px 12px', background: '#fef9c3', color: '#854d0e',
                      border: '1px solid #fde68a', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                    }}
                  >
                    ⭐ {isAr ? 'تعيين افتراضي' : 'Set as default'}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                  disabled={deleting === addr.id}
                  style={{
                    padding: '4px 12px', background: '#fef2f2', color: '#ef4444',
                    border: '1px solid #fecaca', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                  }}
                >
                  {deleting === addr.id ? '...' : (isAr ? 'حذف' : 'Delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new address button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            width: '100%', padding: '12px',
            border: '2px dashed #c4b5fd', borderRadius: '12px',
            background: '#faf8ff', color: '#6c63ff',
            cursor: 'pointer', fontSize: '14px', fontWeight: '700',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          + {isAr ? 'إضافة عنوان جديد' : 'Add new address'}
        </button>
      )}

      {/* Add new address form */}
      {showAddForm && (
        <div style={{
          padding: '1.25rem', border: '2px solid #c4b5fd',
          borderRadius: '14px', background: '#faf8ff',
          marginTop: '4px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#6c63ff' }}>
              {isAr ? 'عنوان جديد' : 'New Address'}
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af' }}
            >✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Label */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                {isAr ? 'التصنيف' : 'LABEL'}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {labelOptions.map((l) => (
                  <button
                    key={l}
                    onClick={() => setNewAddr({ ...newAddr, label: l })}
                    style={{
                      padding: '6px 14px', borderRadius: '999px',
                      border: newAddr.label === l ? '2px solid #6c63ff' : '1.5px solid #e5e7eb',
                      background: newAddr.label === l ? '#6c63ff' : '#fff',
                      color: newAddr.label === l ? '#fff' : '#374151',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                    }}
                  >
                    {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : l === 'Family' ? '👨‍👩‍👧' : '📍'} {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                {isAr ? 'الاسم *' : 'NAME *'}
              </label>
              <input
                value={newAddr.name}
                onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                {isAr ? 'الهاتف *' : 'PHONE *'}
              </label>
              <input
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                placeholder={isAr ? 'رقم الهاتف' : 'Phone number'}
                style={inputStyle}
              />
            </div>

            {/* Region */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                {isAr ? 'منطقة التوصيل *' : 'DELIVERY REGION *'}
              </label>
              <select
                value={newAddr.region_id}
                onChange={(e) => setNewAddr({ ...newAddr, region_id: e.target.value })}
                style={inputStyle}
              >
                <option value="">{isAr ? 'اختر المنطقة' : 'Select region'}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {isAr ? r.name_ar : r.name_en} — EGP {r.delivery_fee}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                {isAr ? 'العنوان التفصيلي *' : 'FULL ADDRESS *'}
              </label>
              <textarea
                value={newAddr.address}
                onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                placeholder={isAr ? 'الشارع، المبنى، الطابق...' : 'Street, building, floor...'}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveAddress}
              disabled={saving || !newAddr.name || !newAddr.phone || !newAddr.address || !newAddr.region_id}
              style={{
                width: '100%', padding: '12px',
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                color: '#fff', border: 'none', borderRadius: '10px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
              }}
            >
              {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? '💾 حفظ العنوان' : '💾 Save Address')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}