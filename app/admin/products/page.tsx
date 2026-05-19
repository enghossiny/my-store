import { supabase } from '@/lib/supabase';
import ProductForm from './ProductForm';
import DeleteProductButton from './DeleteProductButton';

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <h1 style={{ margin: 0 }}>Products</h1>
      </div>

      {/* Add product form */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '16px' }}>Add New Product</h2>
        <ProductForm categories={categories ?? []} />
      </div>

      {/* Products table */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Name (EN)', 'Name (AR)', 'Price', 'Stock', 'Category', 'Actions'].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: '500',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{product.name_en}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{product.name_ar}</td>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>${product.price}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    color: product.stock < 10 ? '#ef4444' : '#16a34a',
                    fontWeight: '500',
                  }}>
                    {product.stock}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                  {product.categories?.name_en ?? '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <DeleteProductButton productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}