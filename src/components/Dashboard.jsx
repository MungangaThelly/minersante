import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

function Dashboard({ supabase }) {
  const { user, appointments, setAppointments, addHealthData, healthData } = useStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [bookingError, setBookingError] = useState(null);

  // react-hook-form + zod schema for appointment
  const bookingSchema = z.object({
    provider: z.string().min(2, t('provider_required')),
    date: z.string().min(1, t('date_required')),
    notes: z.string().optional(),
  });

  const {
    register: registerBooking,
    handleSubmit: handleSubmitBooking,
    formState: { errors: bookingErrors, isSubmitting: bookingSubmitting },
    reset: resetBooking,
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { provider: '', date: '', notes: '' },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id);
        if (apptError) throw apptError;
        setAppointments(apptData || []);

        const { data: healthDataResult, error: healthError } = await supabase
          .from('health_data')
          .select('*')
          .eq('user_id', user.id);
        if (healthError) throw healthError;
        healthDataResult?.forEach((data) => addHealthData(data));
      } catch (err) {
        console.error('Data fetch failed:', err.message);
      }
    };
    fetchData();
  }, [user, supabase, setAppointments, addHealthData]);

  const onBookAppointment = async (formData) => {
    setBookingError(null);
    try {
      const appointmentData = {
        user_id: user.id,
        provider_id: formData.provider,
        date: new Date(formData.date).toISOString(),
        status: 'scheduled',
      };
      if (formData.notes) appointmentData.notes = formData.notes;
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
      if (error) throw error;
      setAppointments([data, ...appointments]);
      resetBooking();
    } catch (err) {
      setBookingError(t('booking_failed') || err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return <p>{t('no_auth')}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          {t('welcome', { name: user.email || 'Guest' })}
        </h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-500 hover:text-red-700 underline"
          aria-label={t('signout')}
        >
          {t('signout')}
        </button>
      </div>

      {/* Appointments & Health Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Appointments */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('upcomingAppointments')}</h2>
          {appointments.length ? (
            appointments.map((appt) => (
              <div key={appt.id} className="border-b py-2">
                {new Date(appt.date).toLocaleString(i18n.language)} {t('with')}{' '}
                {appt.provider || t('unknownProvider')}
                <button className="ml-4 text-blue-500">{t('joinCall')}</button>
              </div>
            ))
          ) : (
            <p>{t('noAppointments')}</p>
          )}
        </div>

        {/* Health Data */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('healthData')}</h2>
          {healthData.length ? (
            healthData.map((data) => (
              <div key={data.id} className="border-b py-1">
                {new Date(data.timestamp).toLocaleString(i18n.language)}:{' '}
                {JSON.stringify(data.data)}
              </div>
            ))
          ) : (
            <p>{t('noHealthData')}</p>
          )}
        </div>
      </div>

      {/* Book Appointment Form */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t('bookAppointment')}</h2>
        <form onSubmit={handleSubmitBooking(onBookAppointment)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('provider')}</label>
            <input
              type="text"
              className={`mt-1 block w-full p-2 border rounded ${bookingErrors.provider ? 'border-red-500' : ''}`}
              placeholder={t('enterProvider')}
              {...registerBooking('provider')}
              disabled={bookingSubmitting}
            />
            {bookingErrors.provider && <p className="text-red-500 text-sm">{bookingErrors.provider.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
            <input
              type="datetime-local"
              className={`mt-1 block w-full p-2 border rounded ${bookingErrors.date ? 'border-red-500' : ''}`}
              {...registerBooking('date')}
              disabled={bookingSubmitting}
            />
            {bookingErrors.date && <p className="text-red-500 text-sm">{bookingErrors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('notes')}</label>
            <textarea
              className="mt-1 block w-full p-2 border rounded"
              placeholder={t('enterNotes')}
              {...registerBooking('notes')}
              disabled={bookingSubmitting}
            />
          </div>
          {bookingError && <p className="text-red-500 text-sm">{bookingError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-60"
            disabled={bookingSubmitting}
          >
            {t('bookNow')}
          </button>
        </form>
      </div>

      {/* Language Switcher */}
      <div className="mt-4">
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default Dashboard;
