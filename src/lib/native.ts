import { Capacitor, registerPlugin } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

// Define the interface for our custom native LiveActivity plugin
interface LiveActivityPlugin {
    startActivity(options: {
        recipeName: string;
        stepName: string;
        endTimestamp: number;
        stepIndex: number;
        totalSteps: number;
    }): Promise<{ activityId: string }>;

    updateActivity(options: {
        stepName: string;
        endTimestamp: number;
        stepIndex: number;
    }): Promise<void>;

    endActivity(): Promise<void>;
}

const LiveActivity = registerPlugin<LiveActivityPlugin>('LiveActivity');

export const native = {
    isNative: Capacitor.isNativePlatform(),

    async vibrate() {
        if (this.isNative) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } else if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    },

    async scheduleNotification(title: string, body: string, secondsFromNow: number) {
        if (!this.isNative) {
            console.log('Web Notification:', title, body);
            // Request permission for web notifications if supported
            if ('Notification' in window && Notification.permission !== 'granted') {
                await Notification.requestPermission();
            }
            if ('Notification' in window && Notification.permission === 'granted') {
                setTimeout(() => {
                    new Notification(title, { body });
                }, secondsFromNow * 1000);
            }
            return;
        }

        // Native Implementation
        try {
            const permission = await LocalNotifications.checkPermissions();
            if (permission.display !== 'granted') {
                await LocalNotifications.requestPermissions();
            }

            await LocalNotifications.schedule({
                notifications: [{
                    title,
                    body,
                    id: Math.floor(Math.random() * 100000),
                    schedule: { at: new Date(Date.now() + secondsFromNow * 1000) },
                    sound: 'notify.wav', // Ensure this file is in the App bundle
                }]
            });
        } catch (e) {
            console.error('Failed to schedule notification', e);
        }
    },

    async cancelNotifications() {
        if (this.isNative) {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel(pending);
            }
        }
    },

    // Live Activities
    async startActivity(recipeName: string, stepName: string, durationSeconds: number, stepIndex: number, totalSteps: number) {
        if (!this.isNative) return;

        try {
            // Calculate absolute timestamp for the end of the timer
            // iOS needs a Date or timestamp to count down to
            const endTimestamp = Date.now() / 1000 + durationSeconds;

            await LiveActivity.startActivity({
                recipeName,
                stepName,
                endTimestamp,
                stepIndex,
                totalSteps
            });
        } catch (e) {
            console.warn('Live Activity start failed (native module likely missing)', e);
        }
    },

    async updateActivity(stepName: string, durationSeconds: number, stepIndex: number) {
        if (!this.isNative) return;

        try {
            const endTimestamp = Date.now() / 1000 + durationSeconds;
            await LiveActivity.updateActivity({
                stepName,
                endTimestamp,
                stepIndex
            });
        } catch (e) {
             console.warn('Live Activity update failed', e);
        }
    },

    async endActivity() {
        if (!this.isNative) return;
        try {
            await LiveActivity.endActivity();
        } catch (e) {
             console.warn('Live Activity end failed', e);
        }
    }
};
