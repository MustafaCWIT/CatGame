import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to track user activities comprehensively.
 * Tracks:
 * 1. Screen Views (which screen the user is on)
 * 2. Time Spent on each screen
 * 3. Interactions (clicks on buttons/links)
 */
export function useActivityTracker(session, currentScreen) {
    const lastScreenTime = useRef(Date.now());
    const lastScreenName = useRef(currentScreen);

    // 1. Track Screen Views & Time Spent
    useEffect(() => {
        // Debug Log: Check if session exists
        if (!session?.user?.id) {
            console.log('ActivityTracker: No session user found, skipping track.');
            return;
        }

        const now = Date.now();
        const timeSpentSeconds = (now - lastScreenTime.current) / 1000;
        const previousScreen = lastScreenName.current;

        // A. Log time spent on the PREVIOUS screen (if meaningful > 1s)
        if (timeSpentSeconds > 1 && previousScreen) {
            const payload = {
                user_id: session.user.id,
                activity_type: 'screen_time',
                activity_details: {
                    screen: previousScreen,
                    duration_seconds: Math.round(timeSpentSeconds),
                    timestamp: new Date().toISOString()
                }
            };

            console.log('ActivityTracker: Saving Screen Time...', payload);

            supabase.from('user_activities').insert(payload).then(({ data, error }) => {
                if (error) console.error('ActivityTracker ERROR (Time):', error);
                else console.log('ActivityTracker SUCCESS (Time): Saved');
            });
        }

        // B. Log the NEW screen view
        const viewPayload = {
            user_id: session.user.id,
            activity_type: 'screen_view',
            activity_details: {
                screen: currentScreen,
                timestamp: new Date().toISOString()
            }
        };

        console.log('ActivityTracker: Saving Screen View...', viewPayload);

        supabase.from('user_activities').insert(viewPayload).then(({ data, error }) => {
            if (error) console.error('ActivityTracker ERROR (View):', error);
            else console.log('ActivityTracker SUCCESS (View): Saved');
        });

        // Reset timers
        lastScreenTime.current = now;
        lastScreenName.current = currentScreen;

    }, [currentScreen, session?.user?.id]);

    // 2. Track Global Clicks (Interactions)
    useEffect(() => {
        if (!session?.user?.id) return;

        const handleClick = (e) => {
            // Find closest interactive element (button, link, input, or specific class)
            // This prevents logging clicks on empty divs/backgrounds
            const target = e.target.closest('button, a, input, [role="button"]');

            if (target) {
                // Prepare useful details
                const label = target.textContent?.slice(0, 50) || target.placeholder || target.name || 'icon/image';
                const elementId = target.id || '';
                const elementClass = target.className || '';

                // Don't log clicks on sensitive inputs (like password fields)
                if (target.type === 'password') return;

                supabase.from('user_activities').insert({
                    user_id: session.user.id,
                    activity_type: 'interaction',
                    activity_details: {
                        screen: currentScreen,
                        element: target.tagName.toLowerCase(),
                        label: label.trim(), // e.g. "Play Game"
                        id: elementId,
                        class: typeof elementClass === 'string' ? elementClass.slice(0, 50) : 'svg/object',
                        timestamp: new Date().toISOString()
                    }
                }).then(({ error }) => {
                    // We suppress errors here to avoid spamming console if offline
                    if (error) console.warn('Activity Track Error (Click):', error.message);
                    else console.log(`tracked click: ${label}`);
                });
            }
        };

        // Attach listener to window
        window.addEventListener('click', handleClick, true); // Capture phase to ensure we catch it

        return () => {
            window.removeEventListener('click', handleClick, true);
        };
    }, [currentScreen, session?.user?.id]);
}
