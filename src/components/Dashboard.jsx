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

  // Edit modal state and logic (must be inside component)
  const [editingAppt, setEditingAppt] = useState(null);
  const [editError, setEditError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form
  const editSchema = z.object({
    provider: z.string().min(2, t('provider_required')),
    date: z.string().min(1, t('date_required')),
    notes: z.string().optional(),
  });
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { provider: '', date: '', notes: '' },
  });

  const openEditModal = (appt) => {
    setEditingAppt(appt);
    setEditValue('provider', appt.provider_id || '');
    setEditValue('date', appt.date ? appt.date.slice(0, 16) : '');
    setEditValue('notes', appt.notes || '');
    setShowEditModal(true);
    setEditError(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAppt(null);
    resetEdit();
    setEditError(null);
  };

  const onEditAppointment = async (formData) => {
    setEditError(null);
    try {
      const { error, data: updated } = await supabase
        .from('appointments')
        .update({
          provider_id: formData.provider,
          date: new Date(formData.date).toISOString(),
          notes: formData.notes,
        })
        .eq('id', editingAppt.id)
        .select()
        .single();
      if (error) throw error;
      setAppointments(
        appointments.map((a) => (a.id === editingAppt.id ? { ...a, ...updated } : a))
      );
      closeEditModal();
    } catch (err) {
      setEditError(t('update_failed') || err.message);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert(t('delete_failed') || err.message);
    }
  };

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
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
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
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-100">
          <h2 className="text-xl font-semibold mb-4">{t('upcomingAppointments')}</h2>
          {appointments.length ? (
            appointments.map((appt) => (
              <div key={appt.id} className="border-b py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  {new Date(appt.date).toLocaleString(i18n.language)} {t('with')}{' '}
                  {appt.provider_id || t('unknownProvider')}
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-500 underline" onClick={() => openEditModal(appt)}>{t('edit')}</button>
                  <button className="text-red-500 underline" onClick={() => handleDeleteAppointment(appt.id)}>{t('delete')}</button>
                  <button
                    className="text-blue-500"
                    onClick={() => {
                      navigate(`/consultation/${appt.id}`);
                    }}
                  >
                    {t('joinCall')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>{t('noAppointments')}</p>
          )}
      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmitEdit(onEditAppointment)} className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-4 relative border border-blue-100" noValidate>
            <button type="button" onClick={closeEditModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <h3 className="text-xl font-bold mb-2">{t('edit_appointment')}</h3>
            <div>
              <label className="block text-sm font-medium mb-1">{t('provider')}</label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${editErrors.provider ? 'border-red-500' : ''}`}
                {...registerEdit('provider')}
                disabled={editSubmitting}
              />
              {editErrors.provider && <p className="text-red-500 text-sm">{editErrors.provider.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('date')}</label>
              <input
                type="datetime-local"
                className={`w-full p-2 border rounded ${editErrors.date ? 'border-red-500' : ''}`}
                {...registerEdit('date')}
                disabled={editSubmitting}
              />
              {editErrors.date && <p className="text-red-500 text-sm">{editErrors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('notes')}</label>
              <textarea
                className="w-full p-2 border rounded"
                {...registerEdit('notes')}
                disabled={editSubmitting}
              />
            </div>
            {editError && <p className="text-red-500 text-sm">{editError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-60"
              disabled={editSubmitting}
            >
              {t('save_changes')}
            </button>
          </form>
        </div>
      )}
        </div>

        {/* Health Data */}
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-100">
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
  <div className="mt-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-100">
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
