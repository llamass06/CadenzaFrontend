import { useState, useEffect } from 'react';

/**
 * usePWAInstall
 *
 * Gestiona el ciclo de vida del evento `beforeinstallprompt` del navegador:
 * intercepta el banner nativo, expone un flag `isInstallable` y una función
 * `handleInstallClick` para disparar el diálogo de instalación manualmente.
 *
 * @returns {{ isInstallable: boolean, handleInstallClick: () => Promise<void> }}
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const onBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const onAppInstalled = () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setIsInstallable(false);
        setDeferredPrompt(null);
    };

    return { isInstallable, handleInstallClick };
}
