import React from 'react';
import { Camera, Eye } from 'lucide-react';

interface NotesAndPhotoFieldsProps {
  notes: string;
  onNotesChange: (value: string) => void;
  image: string | undefined;
  onImageChange: (value: string | undefined) => void;
  photoLabelKind: 'wishlist' | 'gift' | 'task';
  onZoomImage?: (imgUrl: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function NotesAndPhotoFields({
  notes,
  onNotesChange,
  image,
  onImageChange,
  photoLabelKind,
  onZoomImage,
  onImageUpload,
}: NotesAndPhotoFieldsProps) {
  const photoNoun =
    photoLabelKind === 'wishlist' ? 'желания' : photoLabelKind === 'gift' ? 'подарка' : 'задачи';

  return (
    <>
      {/* Notes description */}
      <div className="border-t border-sky-50 pt-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Заметки / Подробности</label>
        <textarea
          placeholder="Ввод текста"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-sky-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 text-sm transition-all resize-none"
        />
      </div>

      {/* Photo attachment section */}
      <div className="border-t border-sky-50 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Фотография {photoNoun}
          </label>
          {image && (
            <button
              type="button"
              onClick={() => onImageChange(undefined)}
              className="text-[10px] text-rose-500 font-bold hover:underline"
            >
              Удалить фото
            </button>
          )}
        </div>

        {image ? (
          <div 
            className="relative rounded-2xl overflow-hidden border border-slate-100 group aspect-[4/3] bg-slate-50 flex items-center justify-center cursor-zoom-in"
            onClick={() => onZoomImage?.(image)}
            title="Нажмите, чтобы открыть фото целиком"
          >
            <img
              src={image}
              alt="Загруженное фото"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoomImage?.(image);
                }}
                className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold shadow transition-all active:scale-95"
              >
                <Eye size={14} />
                <span>Открыть</span>
              </button>
              <label 
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer bg-white/90 hover:bg-white text-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold shadow transition-all active:scale-95 text-center flex items-center"
              >
                Заменить фото
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-100 rounded-xl p-4 cursor-pointer hover:border-sky-300 hover:bg-sky-50/20 transition-all text-center">
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mb-2">
              <Camera size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-700">Загрузить фото желания</span>
            <span className="text-[10px] text-slate-400 mt-1">Доступно только в картоке желания</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </>
  );
}
