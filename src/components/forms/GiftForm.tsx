import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp, Check, Edit2 } from 'lucide-react';
import { Task } from '../../types';
import FormShell from './FormShell';
import NotesAndPhotoFields from './NotesAndPhotoFields';
import {
  FormSubmitPayload,
  NamedColorItem,
  getStyleByColor,
  handleImageUpload,
} from './formHelpers';
import { ThemeId, getDefaultTaskColor } from '../../utils/themeTypes';

interface GiftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormSubmitPayload) => void;
  initialTask?: Task | null;
  defaultGiftRecipient?: string;
  theme?: ThemeId;
  onZoomImage?: (imgUrl: string) => void;
}

export default function GiftForm({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultGiftRecipient,
  theme = 'standard',
  onZoomImage,
}: GiftFormProps) {
  const themeDefaultColor = getDefaultTaskColor(theme);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  const [giftRecipients, setGiftRecipients] = useState<NamedColorItem[]>(() => {
    const saved = localStorage.getItem('gift_recipients_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: 'Папа', color: 'green' },
      { name: 'Мама', color: 'red' },
      { name: 'Лёша', color: 'purple' },
      { name: 'Бабушка', color: 'green' },
    ];
  });
  const [selectedGiftRecipient, setSelectedGiftRecipient] = useState<string>('Папа');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientColor, setNewRecipientColor] = useState(themeDefaultColor);
  const [isAddingGiftRecipient, setIsAddingGiftRecipient] = useState(false);
  const [isGiftDropdownOpen, setIsGiftDropdownOpen] = useState(false);

  const [editingGiftRecipient, setEditingGiftRecipient] = useState<string | null>(null);
  const [editGiftRecipientValue, setEditGiftRecipientValue] = useState<string>('');

  const handleAddNewRecipient = () => {
    const trimmed = newRecipientName.trim();
    if (!trimmed) return;
    if (giftRecipients.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      const match = giftRecipients.find(r => r.name.toLowerCase() === trimmed.toLowerCase())!;
      setSelectedGiftRecipient(match.name);
      setNewRecipientName('');
      setIsAddingGiftRecipient(false);
      return;
    }
    const updated = [...giftRecipients, { name: trimmed, color: newRecipientColor }];
    setGiftRecipients(updated);
    localStorage.setItem('gift_recipients_custom', JSON.stringify(updated));
    setSelectedGiftRecipient(trimmed);
    setNewRecipientName('');
    setIsAddingGiftRecipient(false);
  };

  const handleDeleteGiftRecipient = (recNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = giftRecipients.filter(r => r.name !== recNameToDelete);
    setGiftRecipients(updated);
    localStorage.setItem('gift_recipients_custom', JSON.stringify(updated));
    if (selectedGiftRecipient === recNameToDelete) {
      if (updated.length > 0) {
        setSelectedGiftRecipient(updated[0].name);
      } else {
        setSelectedGiftRecipient('');
      }
    }
  };

  const handleUpdateGiftRecipient = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingGiftRecipient(null);
      return;
    }
    if (giftRecipients.some(r => r.name.toLowerCase() === trimmed.toLowerCase() && r.name !== oldName)) {
      return;
    }
    const updated = giftRecipients.map(r => r.name === oldName ? { ...r, name: trimmed } : r);
    setGiftRecipients(updated);
    localStorage.setItem('gift_recipients_custom', JSON.stringify(updated));
    if (selectedGiftRecipient === oldName) {
      setSelectedGiftRecipient(trimmed);
    }
    setEditingGiftRecipient(null);
  };

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes || '');
      setImage(initialTask.image || undefined);
      setSelectedGiftRecipient(initialTask.giftRecipient || 'Папа');
    } else {
      setTitle('');
      setNotes('');
      setImage(undefined);
      setSelectedGiftRecipient(defaultGiftRecipient || 'Папа');
    }
  }, [initialTask, defaultGiftRecipient, isOpen]);

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, setImage);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recObj = giftRecipients.find(r => r.name === selectedGiftRecipient);
    const finalColor = recObj ? recObj.color : themeDefaultColor;

    onSubmit({
      id: initialTask?.id,
      title: title.trim(),
      category: 'task',
      scope: 'personal',
      date: undefined,
      time: undefined,
      duration: undefined,
      endDate: undefined,
      endTime: undefined,
      notes: notes.trim() || undefined,
      recurrence: { pattern: 'none' },
      isWishlist: false,
      isGift: true,
      wishlistCategory: undefined,
      giftRecipient: selectedGiftRecipient,
      somedayCategory: undefined,
      color: finalColor,
      image,
    });

    onClose();
  };

  if (!isOpen) return null;

  const headerTitle = initialTask ? 'Редактировать подарок' : 'Подарок';

  return (
    <FormShell title={headerTitle} onClose={onClose} onSubmit={handleFormSubmit}>
      {/* Title */}
      <div>
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 px-4 py-2 hover:border-slate-300 transition-colors focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/10 focus-within:bg-white flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            название подарка
          </span>
          <input
            type="text"
            required
            placeholder=""
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-slate-900 font-semibold text-base p-0 border-none focus:ring-0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Получатель подарка (Кому)</label>
          
          {/* Custom select dropdown */}
          <div className="relative">
            {(() => {
              const activeGiftRecipient = giftRecipients.find(r => r.name === selectedGiftRecipient) || { name: selectedGiftRecipient || 'Разное', color: 'dark' };
              const currentStyles = getStyleByColor(activeGiftRecipient.color);

              return (
                <>
                  <button
                    type="button"
                    onClick={() => setIsGiftDropdownOpen(!isGiftDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-900/10 cursor-pointer ${currentStyles.bg}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${currentStyles.dot} shrink-0`} />
                      <span className="truncate">{activeGiftRecipient.name || 'Выберите получателя'}</span>
                    </div>
                    {isGiftDropdownOpen ? <ChevronUp size={16} className="opacity-70" /> : <ChevronDown size={16} className="opacity-70" />}
                  </button>

                  {isGiftDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsGiftDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                        {giftRecipients.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center font-medium">Нет доступных получателей</div>
                        ) : (
                          giftRecipients.map(rec => {
                            const itemStyles = getStyleByColor(rec.color);
                            const isSelected = rec.name === selectedGiftRecipient;
                            const isEditing = editingGiftRecipient === rec.name;

                            if (isEditing) {
                              return (
                                <div 
                                  key={rec.name}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-55 bg-slate-50 border-y border-slate-100"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editGiftRecipientValue}
                                    onChange={e => setEditGiftRecipientValue(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUpdateGiftRecipient(rec.name, editGiftRecipientValue);
                                      } else if (e.key === 'Escape') {
                                        setEditingGiftRecipient(null);
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-850 font-semibold focus:outline-none focus:border-blue-955"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateGiftRecipient(rec.name, editGiftRecipientValue)}
                                    className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                                  >
                                    ОК
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingGiftRecipient(null)}
                                    className="px-2 py-1 bg-slate-200 text-slate-650 font-bold rounded-lg text-[10px] hover:bg-slate-300 transition cursor-pointer"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={rec.name}
                                className={`flex items-center justify-between px-3 py-2 transition-colors cursor-pointer group ${
                                  isSelected ? 'bg-slate-50 font-bold' : 'hover:bg-slate-50'
                                }`}
                                onClick={() => {
                                  setSelectedGiftRecipient(rec.name);
                                  setIsGiftDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`w-2.5 h-2.5 rounded-full ${itemStyles.dot} shrink-0`} />
                                  <span className="text-sm text-slate-800 truncate">{rec.name}</span>
                                  {isSelected && <Check size={14} className="text-slate-500 ml-1.5 shrink-0" />}
                                </div>
                                
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingGiftRecipient(rec.name);
                                      setEditGiftRecipientValue(rec.name);
                                    }}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                    title="Редактировать получателя"
                                    aria-label="Редактировать получателя"
                                  >
                                    <Edit2 size={12} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteGiftRecipient(rec.name, e)}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                    title="Удалить получателя"
                                    aria-label="Удалить получателя"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>

          {/* Sub-toggle and recipient creator box */}
          <div className="mt-2.5">
            {!isAddingGiftRecipient ? (
              <button
                type="button"
                onClick={() => {
                  setNewRecipientColor(themeDefaultColor);
                  setIsAddingGiftRecipient(true);
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wider bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100/50 cursor-pointer"
              >
                <Plus size={12} />
                Добавить получателя
              </button>
            ) : (
              <div className="bg-sky-50/20 p-4 rounded-xl border border-sky-100/50 animate-fade-in space-y-3 mt-1.5">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Добавить получателя</span>
                
                <input
                  type="text"
                  autoFocus
                  placeholder="Имя получателя (например: Сестра)"
                  value={newRecipientName}
                  onChange={e => setNewRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewRecipient();
                    }
                  }}
                />

                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Цвет нового получателя</span>
                  <div className="flex gap-2">
                    {[
                      { value: 'blue', bg: 'bg-[#ABC3D9]', label: 'Синий' },
                      { value: 'purple', bg: 'bg-[#C3ABD9]', label: 'Фиолетовый' },
                      { value: 'orange', bg: 'bg-[#EED0AC]', label: 'Оранжевый' },
                      { value: 'dark', bg: 'bg-[#ABD9D1]', label: 'Индиго' },
                      { value: 'red', bg: 'bg-[#D9ABC3]', label: 'Яркий розовый' },
                      { value: 'green', bg: 'bg-[#C3D9AB]', label: 'Сельдерей' },
                    ].map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewRecipientColor(c.value)}
                        className={`w-5.5 h-5.5 rounded-full ${c.bg} transition-all relative ${
                          newRecipientColor === c.value 
                            ? 'ring-4 ring-offset-2 ring-sky-200 scale-110' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.label}
                        aria-label={c.label}
                      >
                        {newRecipientColor === c.value && (
                          <span className="text-white text-[9px] font-bold absolute inset-0 flex items-center justify-center">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNewRecipientName('');
                      setIsAddingGiftRecipient(false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewRecipient}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/10 transition-all cursor-pointer"
                  >
                    добавить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotesAndPhotoFields
        notes={notes}
        onNotesChange={setNotes}
        image={image}
        onImageChange={setImage}
        photoLabelKind="gift"
        onZoomImage={onZoomImage}
        onImageUpload={onImageUpload}
      />
    </FormShell>
  );
}
