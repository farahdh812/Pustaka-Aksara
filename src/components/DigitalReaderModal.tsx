import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { BookWithStats, LoanRecord } from '../types';

interface DigitalReaderModalProps {
  book: BookWithStats;
  loan: LoanRecord;
  onClose: () => void;
  onSaveProgress: (loanId: string, currentPage: number) => Promise<void>;
}

export function DigitalReaderModal({
  book,
  loan,
  onClose,
  onSaveProgress,
}: DigitalReaderModalProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(loan.currentPage);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [saving, setSaving] = useState(false);

  const chapters = book.chapters;
  const activeChapter = chapters[chapterIndex] ?? chapters[0];
  const progressPercent = Math.min(100, Math.round((currentPage / book.pages) * 100));

  async function handleUpdatePage(nextPage: number) {
    const clamped = Math.max(1, Math.min(book.pages, nextPage));
    setCurrentPage(clamped);
    setSaving(true);
    try {
      await onSaveProgress(loan.id, clamped);
    } finally {
      setSaving(false);
    }
  }

  function handleSelectChapter(index: number) {
    setChapterIndex(index);
    const estimatedPage = Math.max(
      1,
      Math.round(((index + 1) / chapters.length) * book.pages * 0.75)
    );
    void handleUpdatePage(Math.max(currentPage, estimatedPage));
  }

  const proseSizeClass =
    fontSize === 'sm'
      ? 'text-sm sm:text-base'
      : fontSize === 'lg'
        ? 'text-lg sm:text-xl'
        : 'text-base sm:text-[17px]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
      className="fixed inset-0 z-50 flex flex-col bg-[#FBF9F5] text-[#1C1917]"
    >
      {/* Top Reader Toolbar */}
      <header className="border-b border-[#E5DFD3] bg-[#F9F7F3] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-[#78716C] truncate">
            Ruang Baca Digital · {book.author}
          </p>
          <h2 id="reader-title" className="font-serif text-base sm:text-lg font-semibold truncate">
            {book.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Font size switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-[#EFEAE0] rounded-md text-xs">
            {(
              [
                { id: 'sm', label: 'A-' },
                { id: 'md', label: 'A' },
                { id: 'lg', label: 'A+' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFontSize(opt.id)}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  fontSize === opt.id
                    ? 'bg-white text-[#1C1917] font-semibold shadow-xs'
                    : 'text-[#57534E]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C1917] bg-[#EFEAE0] hover:bg-[#E2DACD] rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>
      </header>

      {/* Thin horizontal reading progress bar */}
      <div className="h-1 w-full bg-[#EFEAE0]">
        <div
          className="h-full bg-[#1B4332] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Editorial Reading Column */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="max-w-2xl mx-auto">
          {/* Chapter Tabs */}
          {chapters.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pb-6 mb-8 border-b border-[#E5DFD3]">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.number}
                  type="button"
                  onClick={() => handleSelectChapter(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    idx === chapterIndex
                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                      : 'bg-white text-[#57534E] border-[#DDD5C7] hover:text-[#1C1917]'
                  }`}
                >
                  Bab {ch.number}
                </button>
              ))}
            </div>
          )}

          {activeChapter && (
            <article>
              <p className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
                {book.accessionNumber} · Bagian {activeChapter.number}
              </p>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] leading-snug">
                {activeChapter.title}
              </h3>

              <div className={`mt-8 space-y-6 leading-[1.85] text-[#292524] ${proseSizeClass}`}>
                {activeChapter.content.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className={
                      pIdx === 0
                        ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#1B4332]'
                        : ''
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          )}

          {/* Chapter Navigation */}
          <div className="mt-12 pt-8 border-t border-[#E5DFD3] flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={chapterIndex === 0}
              onClick={() => handleSelectChapter(chapterIndex - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#1C1917] bg-white border border-[#DDD5C7] rounded-md disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bab Sebelumnya</span>
            </button>

            <button
              type="button"
              disabled={chapterIndex >= chapters.length - 1}
              onClick={() => handleSelectChapter(chapterIndex + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1B4332] rounded-md disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Bab Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Progress Sync Bar */}
      <footer className="border-t border-[#E5DFD3] bg-[#F9F7F3] px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1">
            <label htmlFor="reader-page-slider" className="text-xs text-[#57534E] whitespace-nowrap">
              Lacak Halaman:
            </label>
            <input
              id="reader-page-slider"
              type="range"
              min={1}
              max={book.pages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              onMouseUp={() => void handleUpdatePage(currentPage)}
              onTouchEnd={() => void handleUpdatePage(currentPage)}
              className="flex-1 accent-[#1B4332] cursor-pointer"
            />
            <span className="font-mono text-xs tabular-nums text-[#1C1917] whitespace-nowrap">
              {currentPage} / {book.pages} ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleUpdatePage(currentPage)}
              className="px-3.5 py-1.5 text-xs font-medium text-[#1C1917] bg-white border border-[#DDD5C7] rounded-md hover:bg-[#EFEAE0] cursor-pointer whitespace-nowrap"
            >
              {saving ? 'Menyimpan...' : 'Simpan Halaman'}
            </button>
            <button
              type="button"
              disabled={saving || currentPage === book.pages}
              onClick={() => void handleUpdatePage(book.pages)}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              Tandai Tamat (100%)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
