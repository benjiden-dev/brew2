import { useRef, useEffect } from 'react'
import { native } from '@/lib/native'

export function useBrewAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Preload audio
        audioRef.current = new Audio('/notify.wav')
        audioRef.current.load()
    }, [])

    const playNotify = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn("Audio play failed (interaction needed?)", e));
        }

        // Haptic feedback
        native.vibrate();
    }

    return { playNotify }
}

export function useWakeLock() {
    useEffect(() => {
        let wakeLock: WakeLockSentinel | null = null;

        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                    console.log('Wake Lock active');
                } catch (err) {
                    console.warn('Wake Lock failed', err);
                }
            }
        };

        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (wakeLock) {
                wakeLock.release();
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
}
