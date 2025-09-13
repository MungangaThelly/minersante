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
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [reconnectKey, setReconnectKey] = useState(0);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // TURN/STUN config (replace with your own for production)
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    // Example public TURN (replace with your own for production reliability)
    // { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  ];

  useEffect(() => {
    const initializeAppointment = async () => {
      if (appointments.length > 0) {
        const now = new Date();
        const upcoming = appointments
          .filter(appt => new Date(appt.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setCurrentAppointment(upcoming[0] || appointments[0]);
      } else if (user?.id && user?.user_metadata?.role === 'miner') {
        const { data: newAppt, error: apptError } = await supabase
          .from('appointments')
          .insert({
            user_id: user.id,
            provider_id: '', // Update with real provider ID
            date: new Date(Date.now() + 3600000).toISOString(),
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
  }, [appointments, user?.id, user?.user_metadata?.role, supabase, setAppointments]);

  useEffect(() => {
    if (!currentAppointment || !user?.id) return;

    let peerInstance;
    let mediaStream;
    let signalingChannel;

    const initializeCall = async () => {
      setErrorMsg('');
      try {
        setConnectionStatus('connecting');

        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localVideoRef.current.srcObject = mediaStream;
        } catch (mediaError) {
          setErrorMsg('Camera/mic access failed: ' + mediaError.message);
          setConnectionStatus('error');
          return;
        }

        const isInitiator = user.id === currentAppointment.provider_id;

        peerInstance = new Peer({
          initiator: isInitiator,
          trickle: false,
          stream: mediaStream,
          config: { iceServers },
        });

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

            console.log('✅ Signaling data sent');
          } catch (err) {
            setErrorMsg('Signaling insert failed: ' + err.message);
            setConnectionStatus('error');
          }
        });

        peerInstance.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          setConnectionStatus('connected');
        });

        peerInstance.on('connect', () => {
          setConnectionStatus('connected');
        });

        peerInstance.on('error', (err) => {
          setErrorMsg('Peer error: ' + err.message);
          setConnectionStatus('error');
        });

        peerInstance.on('close', () => {
          setConnectionStatus('disconnected');
        });

        setPeer(peerInstance);

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
              if (payload.new.user_id !== user.id) {
                try {
                  peerInstance.signal(JSON.parse(payload.new.signal_data));
                } catch (err) {
                  setErrorMsg('Signal error: ' + err.message);
                }
              }
            }
          );

        const { error: subError } = await signalingChannel.subscribe();
        if (subError) {
          setErrorMsg('Subscription failed: ' + subError.message);
          setConnectionStatus('error');
        }
      } catch (error) {
        setErrorMsg('Call setup failed: ' + error.message);
        setConnectionStatus('error');
      }
    };

    initializeCall();

    return () => {
      leaveCall();
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (signalingChannel) supabase.removeChannel(signalingChannel);
    };
    // eslint-disable-next-line
  }, [currentAppointment?.id, user?.id, supabase, reconnectKey]);

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setVideoOn(prev => !prev);
    }
  };

  const leaveCall = () => {
    if (peer) peer.destroy();
    setPeer(null);
    setConnectionStatus('disconnected');
  };

  const handleReconnect = () => {
    setReconnectKey((k) => k + 1);
  };

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

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {errorMsg}
            {connectionStatus === 'error' && (
              <button
                onClick={handleReconnect}
                className="ml-4 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t('reconnect')}
              </button>
            )}
          </div>
        )}

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
                  {currentAppointment.provider || currentAppointment.provider_id || t('notAssigned')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-auto">
                  <track kind="captions" label="local video captions" />
                </video>
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-auto">
                  <track kind="captions" label="remote video captions" />
                </video>
              </div>

              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={toggleMute}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  {isMuted ? t('unmute') : t('mute')}
                </button>

                <button
                  onClick={toggleVideo}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  {videoOn ? t('stopVideo') : t('startVideo')}
                </button>

                <button
                  onClick={leaveCall}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                >
                  {t('endCall')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoConsultation;
