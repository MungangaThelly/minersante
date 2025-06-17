import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useTranslation } from 'react-i18next';

function VideoConsultation({ supabase }) {
  const { t } = useTranslation();
  const [peer, setPeer] = useState(null);
  const videoRef = useRef();

  useEffect(() => {
    let activePeer;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(async (stream) => {
      videoRef.current.srcObject = stream;

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const p = new SimplePeer({ initiator: true, stream });
      activePeer = p;
      setPeer(p);

      p.on('signal', async (data) => {
        await supabase
          .from('signaling')
          .insert({ user_id: userId, signal_data: data });
      });

      p.on('stream', (remoteStream) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = remoteStream;
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        document.body.appendChild(remoteVideo);
      });

      supabase
        .channel('signaling')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'signaling' },
          (payload) => {
            if (payload.new.user_id !== userId) {
              p.signal(payload.new.signal_data);
            }
          }
        )
        .subscribe();
    });

    return () => {
      activePeer?.destroy();
    };
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">{t('videoConsultation')}</h1>
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md rounded-lg shadow" />
      <div className="mt-4">
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default VideoConsultation;
