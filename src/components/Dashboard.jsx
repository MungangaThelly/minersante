import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

function Dashboard({ supabase }) {
  const { user, appointments, setAppointments, addHealthData, healthData } = useStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [bookingForm, setBookingForm] = useState({ provider: '', date: '', notes: '' });
  const [bookingError, setBookingError] = useState(null);

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

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError(null);
    try {
      const appointmentData = {
        user_id: user.id,
        provider_id: bookingForm.provider,
        date: new Date(bookingForm.date).toISOString(),
        status: 'scheduled',
      };

      // Only include notes if filled (and the DB supports it)
      if (bookingForm.notes) {
        appointmentData.notes = bookingForm.notes;
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;

      setAppointments([data, ...appointments]);
      setBookingForm({ provider: '', date: '', notes: '' });
    } catch (err) {
      console.error('Booking failed:', err.message);
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
        >
          {t('signOut')}
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
                {new Date(appt.date).toLocaleString(i18n.language)}{' '}
                {t('with') || 'with'} {appt.provider || 'Unknown Provider'}
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
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('provider')}</label>
            <input
              type="text"
              value={bookingForm.provider}
              onChange={(e) => setBookingForm({ ...bookingForm, provider: e.target.value })}
              className="mt-1 block w-full p-2 border rounded"
              placeholder={t('enterProvider')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
            <input
              type="datetime-local"
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              className="mt-1 block w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('notes')}</label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              className="mt-1 block w-full p-2 border rounded"
              placeholder={t('enterNotes')}
            />
          </div>
          {bookingError && <p className="text-red-500 text-sm">{bookingError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
