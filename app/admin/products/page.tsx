import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import ProductForm from './ProductForm';
import DeleteProductButton from './DeleteProductButton';
import EditProductModal from './EditProductModal';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name_en)')
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800' }}>Products</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>{products?.length ?? 0} products in store</p>
      </div>

      {/* Add product */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '1.5rem',
        marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6',
      }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '18px', fontWeight: '700' }}>
          ➕ Add New Product
        </h2>
        <ProductForm categories={categories ?? []} />
      </div>

      {/* Products grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {products?.map((product) => (
          <div key={product.id} style={{
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6', overflow: 'hidden',
          }}>
            {/* Image */}
            <div style={{
              height: '160px', background: 'linear-gradient(135deg, #f8f7ff, #ede9ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {product.images?.[0]
                ? <img src={product.images[0]} alt={product.name_en} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '48px' }}>🛍️</span>
              }
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: product.stock < 10 ? '#fef2f2' : '#f0fdf4',
                color: product.stock < 10 ? '#ef4444' : '#16a34a',
                padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
              }}>
                Stock: {product.stock}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '1rem 1.25rem' }}>
              <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: '#1a1a2e' }}>
                {product.name_en}
              </p>
              <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#9ca3af', direction: 'rtl', textAlign: 'left' }}>
                {product.name_ar}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{
                  fontSize: '20px', fontWeight: '800',
                  background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  EGP {product.price}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af', background: '#f3f4f6', padding: '3px 10px', borderRadius: '999px' }}>
                  {product.categories?.name_en ?? 'No category'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <EditProductModal product={product} categories={categories ?? []} />
                <DeleteProductButton productId={product.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}