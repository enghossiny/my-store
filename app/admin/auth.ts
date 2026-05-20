import { cookies } from 'next/headers';

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}