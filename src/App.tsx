import React, { useState, useEffect, useRef } from 'react';
import type { PageId, SiteContent, Photo } from './types';
import { DEFAULT_CONTENT, INITIAL_PHOTOS } from './types';
import {
  loadContent,
  saveContent,
  loadPhotos,
  savePhotos,
  loadMusicFile,
  saveMusicFile,
  saveFinalizedFlag,
} from './utils/storage';

import { FloatingHearts } from './components/FloatingHearts/FloatingHearts';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer';
import type { MusicPlayerHandle } from './components/MusicPlayer/MusicPlayer';
import { EnvelopeSection } from './components/Envelope/EnvelopeSection';
import { LoveLetterSection } from './components/LoveLetter/LoveLetterSection';
import { PhotoAlbumSection } from './components/PhotoAlbum/PhotoAlbumSection';
import { BirthdayCakeSection } from './components/BirthdayCake/BirthdayCakeSection';
import { FinalMessageSection } from './components/FinalMessage/FinalMessageSection';
import { CreatorModal } from './components/CreatorMode/CreatorModal';

import './styles/main.css';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('envelope');
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean>(true);
  const [isCreatorQuery, setIsCreatorQuery] = useState<boolean>(false);
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);

  const musicPlayerRef = useRef<MusicPlayerHandle | null>(null);

  // Load saved content and settings from IndexedDB on mount
  useEffect(() => {
    async function initData() {
      try {
        const storedContent = await loadContent();
        setContent(storedContent);

        const storedPhotos = await loadPhotos();
        setPhotos(storedPhotos);

        const storedMusic = await loadMusicFile();
        if (storedMusic) {
          setCustomMusicUrl(storedMusic);
        }

        // Check if creator requested explicitly via secret URL query: ?edit=1 or ?creator=true
        const params = new URLSearchParams(window.location.search);
        const hasCreatorQuery =
          params.get('creator') === 'true' ||
          params.get('edit') === '1' ||
          params.get('admin') === 'true';

        setIsCreatorQuery(hasCreatorQuery);

        if (hasCreatorQuery) {
          setIsFinalized(false);
          setShowCreatorModal(true);
        } else {
          setIsFinalized(true);
        }
      } catch (err) {
        console.error('Failed to load data from storage:', err);
      }
    }

    initData();
  }, []);

  const handleStartMusic = () => {
    musicPlayerRef.current?.playMusic();
  };

  const handleSaveContent = async (newContent: SiteContent) => {
    setContent(newContent);
    await saveContent(newContent);
  };

  const handleSavePhotos = async (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    await savePhotos(newPhotos);
  };

  const handleUploadCustomMusic = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setCustomMusicUrl(dataUrl);
      await saveMusicFile(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFinalize = async () => {
    setIsFinalized(true);
    await saveFinalizedFlag(true);
    setShowCreatorModal(false);
  };

  return (
    <>
      {/* Romantic Background Atmosphere */}
      <FloatingHearts />

      {/* Persistent Top Navigation Bar */}
      <header className="top-controls-bar">
        <div className="top-controls-left">
          {/* Creator Studio only shows if secret URL parameter is present (?edit=1) */}
          {isCreatorQuery && !isFinalized ? (
            <button
              className="mode-pill-btn"
              onClick={() => setShowCreatorModal(true)}
              title="Open Creator Studio to edit content, text, music"
            >
              <span>⚙️</span> Creator Studio
            </button>
          ) : (
            <div
              style={{
                fontFamily: 'Dancing Script',
                fontSize: '1.25rem',
                color: 'var(--muted-rose)',
                userSelect: 'none',
                letterSpacing: '0.5px',
              }}
            >
              For Moumita ❤️
            </div>
          )}
        </div>

        <div className="top-controls-right">
          <MusicPlayer
            ref={musicPlayerRef}
            customMusicUrl={customMusicUrl}
            volume={content.musicVolume}
          />
        </div>
      </header>

      {/* Main Experience Router */}
      <main className="page-container">
        {/* STEP 1: Opening Envelope */}
        {currentPage === 'envelope' && (
          <EnvelopeSection
            mainHeading={content.mainHeading || 'My Love'}
            subHeading={content.subHeading || 'behind the scenes of my happiness'}
            onOpenLetter={() => setCurrentPage('letter')}
            onStartMusic={handleStartMusic}
          />
        )}

        {/* STEP 2: Love Letter */}
        {currentPage === 'letter' && (
          <LoveLetterSection
            dateHeading={content.letterDate}
            greeting={content.letterGreeting}
            paragraphs={content.letterParagraphs}
            closing={content.letterClosing}
            photoUrl={content.letterPhoto}
            onNext={() => setCurrentPage('album')}
            onBack={() => setCurrentPage('envelope')}
          />
        )}

        {/* STEP 3: Our Photo Album */}
        {currentPage === 'album' && (
          <PhotoAlbumSection
            albumTitle={content.albumTitle || 'Our Memories'}
            albumSubtitle={content.albumSubtitle || 'A collection of beautiful moments ❤️'}
            photos={photos}
            onContinue={() => setCurrentPage('message')}
            onBack={() => setCurrentPage('letter')}
          />
        )}

        {/* STEP 4: Happy Birthday Message */}
        {currentPage === 'message' && (
          <FinalMessageSection
            heading={content.finalHeading}
            paragraphs={content.finalParagraphs}
            loveSignature={content.finalLove}
            onContinueToCake={() => setCurrentPage('cake')}
            onBack={() => setCurrentPage('album')}
          />
        )}

        {/* STEP 5: Birthday Cake (Four Candles) */}
        {currentPage === 'cake' && (
          <BirthdayCakeSection
            onWishComplete={() => setCurrentPage('envelope')}
            onBack={() => setCurrentPage('message')}
          />
        )}
      </main>

      {/* Creator Studio Modal */}
      <CreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        content={content}
        photos={photos}
        onSaveContent={handleSaveContent}
        onSavePhotos={handleSavePhotos}
        onUploadCustomMusic={handleUploadCustomMusic}
        onFinalize={handleFinalize}
      />
    </>
  );
};

export default App;
