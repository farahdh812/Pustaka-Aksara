import { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import type { BookWithStats, LoanRecord } from '../types';
import { BookCover } from './BookCover';

interface CatalogSectionProps {
  books: BookWithStats[];
  activeLoans: LoanRecord[];
  onSelectBook: (book: BookWithStats) => void;
  onBorrowBook: (bookId: string, durationDays: 7 | 14) => Promise<void>;
  onOpenReader: (book: BookWithStats, loan: LoanRecord) => void;
  busyBookId: string | null;
}

const CATEGORIES = [
  'Semua',
  'Fiksi Sastra',
  'Arsitektur & Budaya',
  'Sains & Kosmos',
  'Filsafat & Esai',
  'Sejarah',
] as const;

type SortMode = 'popular' | 'rating' | 'newest' | 'title';

export function CatalogSection({
  books,
  activeLoans,
  onSelectBook,
  onBorrowBook,
  onOpenReader,
  busyBookId,
}: CatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>('popular');

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = books.filter((book) => {
      if (selectedCategory !== 'Semua' && book.category !== selectedCategory) return false;
      if (onlyAvailable && book.availableCopies <= 0) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'popular') return b.popularityScore - a.popularityScore;
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      if (sortBy === 'newest') return b.year - a.year;
      return a.title.localeCompare(b.title, 'id');
    });
  }, [books, searchQuery, selectedCategory, onlyAvailable, sortBy]);

  return (
    <section id="katalog" className="py-12 lg:py-16 border-b border-[#E5DFD3] bg-[#F9F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C]">
              Koleksi Daring
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Katalog Perpustakaan
            </h2>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, penulis, atau ISBN..."
                aria-label="Cari buku dalam katalog"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#DDD5C7] rounded-md text-[#1C1917] placeholder:text-[#78716C] focus:border-[#1B4332]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              aria-label="Urutkan katalog"
              className="px-3 py-2 text-sm bg-white border border-[#DDD5C7] rounded-md text-[#1C1917] cursor-pointer"
            >
              <option value="popular">Urutkan: Terpopuler</option>
              <option value="rating">Urutkan: Rating Tertinggi</option>
              <option value="newest">Urutkan: Terbitan Terbaru</option>
              <option value="title">Urutkan: Judul A–Z</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Filter Bar + Availability Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E5DFD3]">
          <div
            role="tablist"
            aria-label="Filter kategori buku"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFEAE0] rounded-md"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#1C1917] shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#57534E] cursor-pointer select-none whitespace-nowrap shrink-0">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-[#1B4332] rounded cursor-pointer"
            />
            <span>Hanya tampilkan salinan tersedia</span>
          </label>
        </div>

        {/* Catalog Grid */}
        {filteredBooks.length === 0 ? (
          <div className="py-16 text-center border border-[#E5DFD3] bg-[#F4F0E8]">
            <p className="font-serif text-lg text-[#1C1917]">
              Tidak ada buku yang cocok dengan pencarian Anda.
            </p>
            <p className="mt-1 text-sm text-[#57534E]">
              Coba ubah kata kunci pencarian atau pilih kategori lain.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setOnlyAvailable(false);
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-[#1B4332] rounded-md cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredBooks.map((book) => {
              const activeLoan = activeLoans.find((l) => l.bookId === book.id);
              const isBusy = busyBookId === book.id;

              return (
                <article
                  key={book.id}
                  className="group flex flex-col bg-white border border-[#E5DFD3] p-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="text-left cursor-pointer focus-visible:outline-none"
                  >
                    <BookCover book={book} />
                  </button>

                  <div className="mt-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                      <span className="truncate">{book.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums shrink-0">{book.pages} hlm</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5 text-[#1C1917] font-medium tabular-nums shrink-0">
                        <Star className="w-3 h-3 fill-[#B45309] text-[#B45309]" />
                        {book.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectBook(book)}
                      className="mt-1.5 text-left cursor-pointer"
                    >
                      <h3 className="font-serif text-lg font-semibold text-[#1C1917] leading-snug group-hover:text-[#1B4332] transition-colors">
                        {book.title}
                      </h3>
                    </button>
                    <p className="text-xs text-[#57534E] mt-0.5">{book.author}</p>

                    <div className="mt-3 pt-3 border-t border-[#EFEAE0] flex items-center justify-between text-xs text-[#57534E]">
                      <span className="tabular-nums">
                        {activeLoan
                          ? 'Dipinjam aktif'
                          : book.availableCopies > 0
                            ? `${book.availableCopies} dari ${book.totalCopies} tersedia`
                            : 'Sedang habis'}
                      </span>
                      <span className="tabular-nums text-[#78716C]">
                        {book.reviewCount} ulasan
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {activeLoan ? (
                        <button
                          type="button"
                          onClick={() => onOpenReader(book, activeLoan)}
                          className="flex-1 py-2 px-3 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Baca Sekarang
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={book.availableCopies <= 0 || isBusy}
                          onClick={() => onBorrowBook(book.id, 7)}
                          className="flex-1 py-2 px-3 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] disabled:bg-[#D6CEBE] disabled:text-[#57534E] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isBusy
                            ? 'Memproses...'
                            : book.availableCopies > 0
                              ? 'Pinjam 7 Hari'
                              : 'Tidak Tersedia'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="py-2 px-3 text-xs font-medium text-[#1C1917] bg-[#F4F0E8] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Ulasan
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
