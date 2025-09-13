import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-4">{t('admin_dashboard')}</h1>
      <p className="mb-2">{t('admin_welcome')}</p>
      {/* Add admin features here */}
    </div>
  );
}
