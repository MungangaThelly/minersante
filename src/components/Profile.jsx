import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

export default function Profile({ supabase }) {
  const { user, setUser } = useStore();
  const { t, i18n } = useTranslation();

  const schema = z.object({
    email: z.string().email(t('invalid_email')),
    full_name: z.string().min(2, t('name_required')),
    language: z.string().min(2),
    password: z.string().min(6, t('password_min_length')).optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email || '',
      full_name: user?.user_metadata?.full_name || '',
      language: user?.user_metadata?.language || i18n.language,
      password: '',
    },
  });

  const onSubmit = async (data) => {
    // Update user profile in Supabase
    const updates = {
      data: {
        full_name: data.full_name,
        language: data.language,
      },
    };
    if (data.email !== user.email) updates.email = data.email;
    if (data.password) updates.password = data.password;
    const { data: updated, error } = await supabase.auth.updateUser(updates);
    if (!error && updated?.user) {
      setUser(updated.user);
      i18n.changeLanguage(data.language);
      alert(t('profile_updated'));
      reset({ ...data, password: '' });
    } else {
      alert(error?.message || t('update_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow w-full max-w-md space-y-4" noValidate>
        <h2 className="text-2xl font-bold mb-4">{t('profile_settings')}</h2>
        <div>
          <label className="block text-sm font-medium mb-1">{t('username')}</label>
          <input
            type="email"
            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('full_name')}</label>
          <input
            type="text"
            className={`w-full p-2 border rounded ${errors.full_name ? 'border-red-500' : ''}`}
            {...register('full_name')}
            disabled={isSubmitting}
          />
          {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('language')}</label>
          <select
            className="w-full p-2 border rounded"
            {...register('language')}
            disabled={isSubmitting}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ln">Lingala</option>
            <option value="sw">Swahili</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('password')} ({t('optional')})</label>
          <input
            type="password"
            className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : ''}`}
            {...register('password')}
            disabled={isSubmitting}
            autoComplete="new-password"
            placeholder={t('new_password')}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {t('save_changes')}
        </button>
      </form>
    </div>
  );
}
