import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp, Check, Edit2, Link as LinkIcon } from 'lucide-react';
import { Task } from '../../types';
import FormShell from './FormShell';
import NotesAndPhotoFields from './NotesAndPhotoFields';
import {
  FormSubmitPayload,
  NamedColorItem,
  getStyleByColor,
  handleImageUpload,
  normalizeExternalUrl,
} from './formHelpers';
import { ThemeId, getDefaultTaskColor } from '../../utils/themeTypes';

interface WishlistFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormSubmitPayload) => void;
  initialTask?: Task | null;
  defaultWishlistCategory?: string;
  theme?: ThemeId;
  onZoomImage?: (imgUrl: string) => void;
}

export default function WishlistForm({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultWishlistCategory,
  theme = 'standard',
  onZoomImage,
}: WishlistFormProps) {
  const themeDefaultColor = getDefaultTaskColor(theme);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  const [wishlistCategories, setWishlistCategories] = useState<NamedColorItem[]>(() => {
    const saved = localStorage.getItem('wishlist_categories_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: 'Одежда', color: 'red' },
      { name: 'Дом', color: 'green' },
      { name: 'Хобби', color: 'purple' },
    ];
  });
  const [selectedWishlistCategory, setSelectedWishlistCategory] = useState<string>('Одежда');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(themeDefaultColor);
  const [isAddingWishlistCat, setIsAddingWishlistCat] = useState(false);
  const [isWishlistDropdownOpen, setIsWishlistDropdownOpen] = useState(false);

  const [editingWishlistCat, setEditingWishlistCat] = useState<string | null>(null);
  const [editWishlistCatValue, setEditWishlistCatValue] = useState<string>('');

  const handleAddNewCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (wishlistCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      const match = wishlistCategories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())!;
      setSelectedWishlistCategory(match.name);
      setNewCatName('');
      setIsAddingWishlistCat(false);
      return;
    }
    const updated = [...wishlistCategories, { name: trimmed, color: newCatColor }];
    setWishlistCategories(updated);
    localStorage.setItem('wishlist_categories_custom', JSON.stringify(updated));
    setSelectedWishlistCategory(trimmed);
    setNewCatName('');
    setIsAddingWishlistCat(false);
  };

  const handleDeleteWishlistCategory = (catNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = wishlistCategories.filter(c => c.name !== catNameToDelete);
    setWishlistCategories(updated);
    localStorage.setItem('wishlist_categories_custom', JSON.stringify(updated));
    if (selectedWishlistCategory === catNameToDelete) {
      if (updated.length > 0) {
        setSelectedWishlistCategory(updated[0].name);
      } else {
        setSelectedWishlistCategory('');
      }
    }
  };

  const handleUpdateWishlistCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingWishlistCat(null);
      return;
    }
    if (wishlistCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.name !== oldName)) {
      return;
    }
    const updated = wishlistCategories.map(c => c.name === oldName ? { ...c, name: trimmed } : c);
    setWishlistCategories(updated);
    localStorage.setItem('wishlist_categories_custom', JSON.stringify(updated));
    if (selectedWishlistCategory === oldName) {
      setSelectedWishlistCategory(trimmed);
    }
    setEditingWishlistCat(null);
  };

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setLink(initialTask.link || '');
      setNotes(initialTask.notes || '');
      setImage(initialTask.image || undefined);
      setSelectedWishlistCategory(initialTask.wishlistCategory || 'Одежда');
    } else {
      setTitle('');
      setLink('');
      setNotes('');
      setImage(undefined);
      setSelectedWishlistCategory(defaultWishlistCategory || 'Одежда');
    }
  }, [initialTask, defaultWishlistCategory, isOpen]);

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, setImage);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = wishlistCategories.find(c => c.name === selectedWishlistCategory);
    const finalColor = catObj ? catObj.color : themeDefaultColor;

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
      link: normalizeExternalUrl(link) || undefined,
      recurrence: { pattern: 'none' },
      isWishlist: true,
      isGift: false,
      wishlistCategory: selectedWishlistCategory,
      giftRecipient: undefined,
      somedayCategory: undefined,
      color: finalColor,
      image,
    });

    onClose();
  };

  if (!isOpen) return null;

  const headerTitle = initialTask ? 'Редактировать желание' : 'Желание';

  return (
    <FormShell title={headerTitle} onClose={onClose} onSubmit={handleFormSubmit}>
      {/* Title */}
      <div>
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 px-4 py-2 hover:border-slate-300 transition-colors focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/10 focus-within:bg-white flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            название желания
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Категория желания</label>
          
          {/* Custom select dropdown */}
          <div className="relative">
            {(() => {
              const activeWishlistCat = wishlistCategories.find(c => c.name === selectedWishlistCategory) || { name: selectedWishlistCategory || 'Разное', color: 'dark' };
              const currentStyles = getStyleByColor(activeWishlistCat.color);

              return (
                <>
                  <button
                    type="button"
                    onClick={() => setIsWishlistDropdownOpen(!isWishlistDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-900/10 cursor-pointer ${currentStyles.bg}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${currentStyles.dot} shrink-0`} />
                      <span className="truncate">{activeWishlistCat.name || 'Выберите категорию'}</span>
                    </div>
                    {isWishlistDropdownOpen ? <ChevronUp size={16} className="opacity-70" /> : <ChevronDown size={16} className="opacity-70" />}
                  </button>

                  {isWishlistDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsWishlistDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                        {wishlistCategories.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center font-medium">Нет доступных категорий</div>
                        ) : (
                          wishlistCategories.map(cat => {
                            const itemStyles = getStyleByColor(cat.color);
                            const isSelected = cat.name === selectedWishlistCategory;
                            const isEditing = editingWishlistCat === cat.name;

                            if (isEditing) {
                              return (
                                <div 
                                  key={cat.name}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-55 bg-slate-50 border-y border-slate-100"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editWishlistCatValue}
                                    onChange={e => setEditWishlistCatValue(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUpdateWishlistCategory(cat.name, editWishlistCatValue);
                                      } else if (e.key === 'Escape') {
                                        setEditingWishlistCat(null);
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-850 font-semibold focus:outline-none focus:border-blue-955"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateWishlistCategory(cat.name, editWishlistCatValue)}
                                    className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                                  >
                                    ОК
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingWishlistCat(null)}
                                    className="px-2 py-1 bg-slate-200 text-slate-650 font-bold rounded-lg text-[10px] hover:bg-slate-300 transition cursor-pointer"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={cat.name}
                                className={`flex items-center justify-between px-3 py-2 transition-colors cursor-pointer group ${
                                  isSelected ? 'bg-slate-50 font-bold' : 'hover:bg-slate-50'
                                }`}
                                onClick={() => {
                                  setSelectedWishlistCategory(cat.name);
                                  setIsWishlistDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`w-2.5 h-2.5 rounded-full ${itemStyles.dot} shrink-0`} />
                                  <span className="text-sm text-slate-800 truncate">{cat.name}</span>
                                  {isSelected && <Check size={14} className="text-slate-500 ml-1.5 shrink-0" />}
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingWishlistCat(cat.name);
                                      setEditWishlistCatValue(cat.name);
                                    }}
                                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                    title="Редактировать категорию"
                                    aria-label="Редактировать категорию"
                                  >
                                    <Edit2 size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteWishlistCategory(cat.name, e)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Удалить категорию"
                                    aria-label="Удалить категорию"
                                  >
                                    <Trash2 size={14} strokeWidth={2.25} />
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

          {/* Sub-toggle and category creator box */}
          <div className="mt-2.5">
            {!isAddingWishlistCat ? (
              <button
                type="button"
                onClick={() => {
                  setNewCatColor(themeDefaultColor);
                  setIsAddingWishlistCat(true);
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wider bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100/50 cursor-pointer"
              >
                <Plus size={12} />
                Добавить категорию
              </button>
            ) : (
              <div className="bg-sky-50/20 p-4 rounded-xl border border-sky-100/50 animate-fade-in space-y-3 mt-1.5">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Добавить категорию</span>
                
                <input
                  type="text"
                  autoFocus
                  placeholder="Название категории (например: Книги)"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewCategory();
                    }
                  }}
                />

                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Цвет новой категории</span>
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
                        onClick={() => setNewCatColor(c.value)}
                        className={`w-5.5 h-5.5 rounded-full ${c.bg} transition-all relative ${
                          newCatColor === c.value 
                            ? 'ring-4 ring-offset-2 ring-sky-200 scale-110' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.label}
                        aria-label={c.label}
                      >
                        {newCatColor === c.value && (
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
                      setNewCatName('');
                      setIsAddingWishlistCat(false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
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

      <div className="border-t border-sky-50 pt-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Ссылка
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/20 px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
          <LinkIcon size={15} className="text-slate-400 shrink-0" />
          <input
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={link}
            onChange={e => setLink(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-slate-700 text-sm font-medium p-0 border-none"
          />
        </div>
      </div>

      <NotesAndPhotoFields
        notes={notes}
        onNotesChange={setNotes}
        image={image}
        onImageChange={setImage}
        photoLabelKind="wishlist"
        onZoomImage={onZoomImage}
        onImageUpload={onImageUpload}
      />
    </FormShell>
  );
}
