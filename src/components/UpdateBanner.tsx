import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';

export default function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updating, setUpdating] = useState(false);
  const updateRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let removeListeners: (() => void) | undefined;

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegistered(registration) {
        if (!registration) return;
        registrationRef.current = registration;

        const checkForUpdate = () => registration.update().catch(() => {});

        const onVisible = () => {
          if (document.visibilityState === 'visible') {
            checkForUpdate();
          }
        };

        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', checkForUpdate);

        removeListeners = () => {
          document.removeEventListener('visibilitychange', onVisible);
          window.removeEventListener('focus', checkForUpdate);
        };
      },
    });

    updateRef.current = updateSW;

    return () => removeListeners?.();
  }, []);

  const forceReload = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', Date.now().toString());
    window.location.replace(url.toString());
  }, []);

  const handleUpdate = async () => {
    if (updating) return;
    setUpdating(true);

    const registration = registrationRef.current;

    const reloadOnControllerChange = () => {
      navigator.serviceWorker?.addEventListener(
        'controllerchange',
        () => window.location.reload(),
        { once: true }
      );
    };

    reloadOnControllerChange();

    try {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      if (updateRef.current) {
        await updateRef.current(true);
      }
    } catch {
      // fall through to hard reload below
    }

    // iOS standalone PWA often ignores controllerchange — force reload as fallback
    window.setTimeout(() => {
      forceReload();
    }, 600);
  };

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 z-[10000] mx-auto max-w-2xl animate-fade-in pointer-events-auto"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[#0C3B2E]/15 bg-[#0C3B2E] px-4 py-3.5 text-white shadow-2xl shadow-[#0C3B2E]/25">
        <RefreshCw size={20} className={`shrink-0 text-[#6D9773] ${updating ? 'animate-spin' : ''}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Доступно обновление</p>
          <p className="mt-0.5 text-xs text-white/70">Ваши задачи и заметки сохранятся</p>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={updating}
          className="shrink-0 rounded-xl bg-[#6D9773] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#58825e] active:scale-95 disabled:opacity-70"
        >
          {updating ? '…' : 'Обновить'}
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          disabled={updating}
          className="shrink-0 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          aria-label="Позже"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
