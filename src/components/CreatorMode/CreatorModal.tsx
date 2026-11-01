import React, { useState, useRef } from 'react';
import type { SiteContent, Photo } from '../../types';
import { exportAllData, importAllData } from '../../utils/storage';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
  photos: Photo[];
  onSaveContent: (newContent: SiteContent) => void;
  onSavePhotos: (newPhotos: Photo[]) => void;
  onUploadCustomMusic: (file: File) => void;
  onFinalize: () => void;
}

const resolvePhotoSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  const clean = src.startsWith('/') ? src.slice(1) : src;
  return `${import.meta.env.BASE_URL}${clean}`;
};

export const CreatorModal: React.FC<CreatorModalProps> = ({
  isOpen,
  onClose,
  content,
  photos,
  onSaveContent,
  onSavePhotos,
  onUploadCustomMusic,
  onFinalize,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'photos' | 'mystery' | 'music'>('text');
  const [formData, setFormData] = useState<SiteContent>({ ...content });
  const [photoList, setPhotoList] = useState<Photo[]>([...photos]);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const photoFileInputRef = useRef<HTMLInputElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof SiteContent, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParagraphChange = (index: number, val: string) => {
    const updated = [...formData.letterParagraphs];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, letterParagraphs: updated }));
  };

  const addParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      letterParagraphs: [...prev.letterParagraphs, ''],
    }));
  };

  const removeParagraph = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      letterParagraphs: prev.letterParagraphs.filter((_, i) => i !== index),
    }));
  };

  // Photo management
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotoList((prev) => [
          ...prev,
          {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            data: base64,
            caption: 'A precious memory with you ❤️',
            order: prev.length,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (id: string) => {
    setPhotoList((prev) => prev.filter((p) => p.id !== id));
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photoList.length) return;

    const newList = [...photoList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIdx, 0, moved);
    setPhotoList(newList.map((p, i) => ({ ...p, order: i })));
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotoList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  // Handle Save
  const handleSaveDraft = () => {
    onSaveContent(formData);
    onSavePhotos(photoList);
    setSaveStatus('Draft saved to IndexedDB! ✨');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Handle Export
  const handleExport = async () => {
    handleSaveDraft();
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moumita-birthday-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        await importAllData(text);
        setSaveStatus('Imported successfully! Reloading…');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        alert('Failed to import file. Please check JSON format.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomMusic(file);
      setSaveStatus('Background music updated! 🎵');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="creator-modal-backdrop" onClick={onClose}>
      <div
        className="creator-panel-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="creator-panel-header">
          <div className="creator-panel-title">
            <span>✨</span> Creator Studio — Personalize Moumita's Birthday Gift
          </div>
          <button className="creator-close-btn" onClick={onClose} title="Close & Preview">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="creator-tabs-nav">
          <button
            className={`creator-tab-button ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            💌 Envelope & Love Letter
          </button>
          <button
            className={`creator-tab-button ${activeTab === 'mystery' ? 'active' : ''}`}
            onClick={() => setActiveTab('mystery')}
          >
            💖 Birthday Message
          </button>
          <button
            className={`creator-tab-button ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            🎵 Music & Backup
          </button>
        </div>

        {/* Tab Body */}
        <div className="creator-panel-body">
          {saveStatus && (
            <div style={{ padding: '0.6rem 1rem', background: '#d4edda', color: '#155724', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {saveStatus}
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#a8384a' }}>Section 1: Opening Envelope</h3>
              <div className="creator-form-group">
                <label className="creator-form-label">Heading</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.mainHeading}
                  onChange={(e) => handleTextChange('mainHeading', e.target.value)}
                />
              </div>

              <div className="creator-form-group">
                <label className="creator-form-label">Subtitle / Description</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.subHeading}
                  onChange={(e) => handleTextChange('subHeading', e.target.value)}
                />
              </div>

              <hr style={{ margin: '1.5rem 0', borderColor: '#f4d8dc' }} />

              <h3 style={{ marginBottom: '1rem', color: '#a8384a' }}>Section 2: Love Letter</h3>
              <div className="creator-form-group">
                <label className="creator-form-label">Date Heading</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.letterDate}
                  onChange={(e) => handleTextChange('letterDate', e.target.value)}
                />
              </div>

              <div className="creator-form-group">
                <label className="creator-form-label">Salutation</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.letterGreeting}
                  onChange={(e) => handleTextChange('letterGreeting', e.target.value)}
                />
              </div>

              <div className="creator-form-group">
                <label className="creator-form-label">Love Letter Paragraphs (Editable & Reorderable)</label>
                {formData.letterParagraphs.map((para, i) => (
                  <div key={i} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                    <textarea
                      className="creator-textarea"
                      value={para}
                      onChange={(e) => handleParagraphChange(i, e.target.value)}
                    />
                    <button
                      type="button"
                      className="creator-mini-btn danger"
                      onClick={() => removeParagraph(i)}
                      title="Remove paragraph"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button type="button" className="secondary-btn" onClick={addParagraph}>
                  + Add Paragraph
                </button>
              </div>

              <div className="creator-form-group">
                <label className="creator-form-label">Sign-off / Closing</label>
                <textarea
                  className="creator-textarea"
                  value={formData.letterClosing}
                  onChange={(e) => handleTextChange('letterClosing', e.target.value)}
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#a8384a' }}>Interactive Photo Album</h3>
                <button
                  className="romantic-btn"
                  onClick={() => photoFileInputRef.current?.click()}
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                >
                  + Upload Photographs
                </button>
                <input
                  type="file"
                  ref={photoFileInputRef}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </div>

              <p style={{ fontSize: '0.85rem', color: '#795548', margin: '0.5rem 0 1rem' }}>
                Every uploaded photograph automatically gets its own page in the album with page-turn navigation.
              </p>

              <div className="photo-manager-grid">
                {photoList.map((photo, idx) => (
                  <div key={photo.id || idx} className="photo-manager-card">
                    <img src={resolvePhotoSrc(photo.data)} alt="Album item" className="photo-card-img" />
                    <input
                      type="text"
                      className="creator-input"
                      value={photo.caption}
                      placeholder="Caption..."
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                      onChange={(e) => updateCaption(photo.id, e.target.value)}
                    />
                    <div className="photo-card-actions">
                      <button
                        className="creator-mini-btn"
                        onClick={() => movePhoto(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ◀
                      </button>
                      <button
                        className="creator-mini-btn"
                        onClick={() => movePhoto(idx, 'down')}
                        disabled={idx === photoList.length - 1}
                        title="Move Down"
                      >
                        ▶
                      </button>
                      <button
                        className="creator-mini-btn danger"
                        onClick={() => deletePhoto(photo.id)}
                        title="Delete Photo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mystery' && (
            <div>
              <h3 style={{ color: '#a8384a', marginBottom: '1rem' }}>Section 3: Mystery Surprise</h3>
              <div className="creator-form-group">
                <label className="creator-form-label">Heart Initials</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.mysteryInitials}
                  onChange={(e) => handleTextChange('mysteryInitials', e.target.value)}
                />
              </div>

              <div className="creator-form-group">
                <label className="creator-form-label">Mystery Message</label>
                <textarea
                  className="creator-textarea"
                  value={formData.mysteryMessage}
                  onChange={(e) => handleTextChange('mysteryMessage', e.target.value)}
                />
              </div>

              <hr style={{ margin: '1.5rem 0', borderColor: '#f4d8dc' }} />

              <h3 style={{ color: '#a8384a', marginBottom: '1rem' }}>Section 6: Final Birthday Message</h3>
              <div className="creator-form-group">
                <label className="creator-form-label">Final Page Heading</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.finalHeading}
                  onChange={(e) => handleTextChange('finalHeading', e.target.value)}
                />
              </div>

              <div className="creator-form-group">
                <label className="creator-form-label">Final Love Signature</label>
                <input
                  type="text"
                  className="creator-input"
                  value={formData.finalLove}
                  onChange={(e) => handleTextChange('finalLove', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div>
              <h3 style={{ color: '#a8384a', marginBottom: '1rem' }}>Background Music & Volume</h3>
              <div className="creator-form-group">
                <label className="creator-form-label">Replace Background Music (MP3 / Audio File)</label>
                <input
                  type="file"
                  ref={musicFileInputRef}
                  accept="audio/*"
                  onChange={handleMusicUpload}
                />
              </div>

              <div className="creator-form-group" style={{ marginTop: '1.5rem' }}>
                <label className="creator-form-label">Starting Volume: {Math.round(formData.musicVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.musicVolume}
                  onChange={(e) => handleTextChange('musicVolume', parseFloat(e.target.value))}
                  style={{ width: '220px' }}
                />
              </div>

              <hr style={{ margin: '1.5rem 0', borderColor: '#f4d8dc' }} />

              <h3 style={{ color: '#a8384a', marginBottom: '1rem' }}>Backup & Transfer</h3>
              <p style={{ fontSize: '0.85rem', color: '#795548', marginBottom: '1rem' }}>
                Export all your customized text, photos, and music into a single JSON file. You can import it on another computer or before deploying!
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="secondary-btn" onClick={handleExport}>
                  📥 Export Content Backup (.json)
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => importFileInputRef.current?.click()}
                >
                  📤 Import Content Backup (.json)
                </button>
                <input
                  type="file"
                  ref={importFileInputRef}
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImport}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="creator-panel-footer">
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="secondary-btn" onClick={handleSaveDraft}>
              💾 Save Draft
            </button>
            <button className="secondary-btn" onClick={onClose}>
              👁️ Preview Website
            </button>
          </div>

          <button
            className="romantic-btn"
            onClick={() => {
              handleSaveDraft();
              onFinalize();
            }}
            style={{ background: 'linear-gradient(135deg, #2e7d32, #43a047)' }}
          >
            🔒 Finalize for Moumita (Lock Birthday Mode)
          </button>
        </div>
      </div>
    </div>
  );
};
