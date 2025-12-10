import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-900 text-gray-900 dark:text-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
}
