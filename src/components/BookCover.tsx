import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Book } from '../types';

interface BookCoverProps {
  book: Book;
  className?: string;
  showSpineTitle?: boolean;
}

export function BookCover({ book, className = '', showSpineTitle = true }: BookCoverProps) {
  const [imgError, setImgError] = useState(false);

  if (book.coverImage && !imgError) {
    return (
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden bg-[#EBE6DF] border border-[#E2DACD] ${className}`}
      >
        <img
          src={book.coverImage}
          alt={`Sampul buku ${book.title} karya ${book.author}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  // Clothbound editorial cover for books without photographic artwork or as resilient fallback
  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden border border-black/15 flex flex-col justify-between p-5 select-none ${className}`}
      style={{ backgroundColor: book.clothColor, color: book.clothAccent }}
    >
      {/* Subtle spine indentation line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 w-px bg-black/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3.5 w-px bg-white/15"
      />

      <div className="pl-3 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase opacity-80">
        <span>{book.accessionNumber}</span>
        <span>{book.year}</span>
      </div>

      {showSpineTitle ? (
        <div className="pl-3 my-auto py-4 border-y border-current/25">
          <p className="text-[11px] uppercase tracking-widest opacity-80 mb-2">
            {book.category}
          </p>
          <h4 className="font-serif text-lg sm:text-xl leading-snug font-semibold text-balance">
            {book.title}
          </h4>
          <p className="mt-2 text-xs opacity-85">{book.author}</p>
        </div>
      ) : (
        <div className="my-auto flex items-center justify-center opacity-70">
          <BookOpen className="w-8 h-8" strokeWidth={1.25} />
        </div>
      )}

      <div className="pl-3 flex items-center justify-between text-[11px] opacity-75">
        <span className="truncate">{book.publisher}</span>
        <span className="font-mono tabular-nums">{book.pages} hlm</span>
      </div>
    </div>
  );
}
