import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';

export default function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let removeListeners: (() => void) | undefined;

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegistered(registration) {
        if (!registration) return;

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

  const handleUpdate = () => {
    updateRef.current?.(true);
  };

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 z-[10000] mx-auto max-w-2xl animate-fade-in"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[#0C3B2E]/15 bg-[#0C3B2E] px-4 py-3.5 text-white shadow-2xl shadow-[#0C3B2E]/25">
        <RefreshCw size={20} className="shrink-0 text-[#6D9773]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Доступно обновление</p>
          <p className="mt-0.5 text-xs text-white/70">Ваши задачи и заметки сохранятся</p>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          className="shrink-0 rounded-xl bg-[#6D9773] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#58825e] active:scale-95"
        >
          Обновить
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="shrink-0 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Позже"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
