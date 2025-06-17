import { useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useStore } from '../store.js';
import { useTranslation } from 'react-i18next';


function Dashboard({ supabase }) {
  const { user, appointments, healthData, setAppointments, addHealthData } = useStore();
  const { t } = useTranslation();

  function uniqueById(array) {
    const seen = new Set();
    return array.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      // Fetch appointments
      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id);

    setAppointments(uniqueById(apptData || []));

    // Fetch health data
    const { data: healthData } = await supabase
      .from('health_data')
      .select('*')
      .eq('user_id', user.id);

    uniqueById(healthData || []).forEach((data) => addHealthData(data));
  };
  if (user) fetchData();
}, [user, supabase]);


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">{t('welcome', { name: user?.email })}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{t('upcomingAppointments')}</h2>
          {appointments.length ? (
            appointments.map((appt) => (
              <div key={appt.id} className="border-b py-2">
                {appt.date} with {appt.provider}
                <button className="ml-4 text-blue-500">{t('joinCall')}</button>
              </div>
            ))
          ) : (
            <p>{t('noAppointments')}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{t('healthData')}</h2>
          {healthData.length ? (
            healthData.map((data) => (
              <div key={data.id} className="border-b py-2">
                {data.timestamp}: {JSON.stringify(data.data)}
              </div>
            ))
          ) : (
            <p>{t('noHealthData')}</p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default Dashboard;