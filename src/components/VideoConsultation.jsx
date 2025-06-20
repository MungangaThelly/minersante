import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import Peer from 'simple-peer/simplepeer.min.js';
import LanguageSwitcher from './LanguageSwitcher.jsx';

function VideoConsultation({ supabase }) {
  const { t } = useTranslation();
  const { appointments, user, setAppointments } = useStore();
  const [peer, setPeer] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // Fetch or create appointment on mount or appointments update
  useEffect(() => {
    const initializeAppointment = async () => {
      if (appointments.length > 0) {
        const now = new Date();
        const upcoming = appointments
          .filter(appt => new Date(appt.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setCurrentAppointment(upcoming[0] || appointments[0]);
      } else if (user?.id) {
        // Create a new appointment if none exist
        const { data: newAppt, error: apptError } = await supabase
          .from('appointments')
          .insert({
            user_id: user.id,
            provider_id: 'b26effec-0b06-44bb-8fa7-0f74d2f08be2', // replace with your provider's id
            date: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            status: 'scheduled',
          })
          .select()
          .single();

        if (apptError) {
          console.error('Failed to create appointment:', apptError.message);
          return;
        }

        setAppointments([newAppt, ...appointments]);
        setCurrentAppointment(newAppt);
      }
    };

    initializeAppointment();
  }, [appointments, user?.id, supabase, setAppointments]);

  // Initialize WebRTC call + signaling when appointment or user changes
  useEffect(() => {
    if (!currentAppointment || !user?.id) return;

    let peerInstance;
    let mediaStream;
    let signalingChannel;

    const initializeCall = async () => {
      try {
        setConnectionStatus('connecting');

        // Request camera and mic
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localVideoRef.current.srcObject = mediaStream;
        } catch (mediaError) {
          alert('Camera/mic access failed: ' + mediaError.message);
          setConnectionStatus('error');
          return;
        }

        // Determine if current user is the initiator
        const isInitiator = user.id === currentAppointment.provider_id;

        peerInstance = new Peer({
          initiator: isInitiator,
          trickle: false,  // trickle ICE disabled for simplicity; enable if needed
          stream: mediaStream,
        });

        // Send signaling data to supabase table
        peerInstance.on('signal', async (signalData) => {
          try {
            const { error } = await supabase
              .from('signaling')
              .insert({
                user_id: user.id,
                appointment_id: currentAppointment.id,
                signal_data: JSON.stringify(signalData),
                created_at: new Date().toISOString(),
              });

            if (error) throw error;

            console.log('✅ Signaling data sent for appointment', currentAppointment.id);
          } catch (err) {
            console.error('❌ Signaling insert failed:', err.message);
            setConnectionStatus('error');
          }
        });

        // When receiving remote stream, show it in remote video
        peerInstance.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          setConnectionStatus('connected');
        });

        peerInstance.on('connect', () => {
          console.log('✅ Peer connection established');
          setConnectionStatus('connected');
        });

        peerInstance.on('error', (err) => {
          console.error('❌ Peer error:', err);
          setConnectionStatus('error');
        });

        peerInstance.on('close', () => {
          console.log('❌ Peer connection closed');
          setConnectionStatus('disconnected');
        });

        setPeer(peerInstance);

        // Subscribe to signaling channel for this appointment
        signalingChannel = supabase
          .channel(`signaling-${currentAppointment.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'signaling',
              filter: `appointment_id=eq.${currentAppointment.id}`,
            },
            (payload) => {
              // Ignore signals sent by self
              if (payload.new.user_id !== user.id) {
                console.log('⬅️ Received signaling data from peer');
                peerInstance.signal(JSON.parse(payload.new.signal_data));
              }
            }
          );

        const { error: subError } = await signalingChannel.subscribe();
        if (subError) {
          console.error('❌ Subscription failed:', subError);
          setConnectionStatus('error');
        } else {
          console.log('✅ Subscribed to signaling channel');
        }
      } catch (error) {
        console.error('❌ Call initialization failed:', error);
        setConnectionStatus('error');
      }
    };

    initializeCall();

    // Cleanup on unmount or dependency change
    return () => {
      if (peerInstance) peerInstance.destroy();
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (signalingChannel) supabase.removeChannel(signalingChannel);
    };
  }, [currentAppointment?.id, user?.id, supabase]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t('videoConsultation')}
            {currentAppointment?.provider && (
              <span className="text-xl font-normal ml-2">
                with {currentAppointment.provider}
              </span>
            )}
          </h1>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'connected'
                  ? 'bg-green-100 text-green-800'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {t(`status.${connectionStatus}`)}
            </span>
            <LanguageSwitcher />
          </div>
        </header>

        {!currentAppointment ? (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500 mb-4">{t('noUpcomingAppointments')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('appointmentDetails')}</h2>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(currentAppointment.date).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Provider:</span>{' '}
                  {currentAppointment.provider || 'Not assigned'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                />
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoConsultation;
