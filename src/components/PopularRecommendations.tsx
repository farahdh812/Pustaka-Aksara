import { ArrowUpRight, Star } from 'lucide-react';
import type { BookWithStats, LoanRecord } from '../types';
import { BookCover } from './BookCover';

interface PopularRecommendationsProps {
  popularBooks: BookWithStats[];
  personalizedRecommendations: Array<{
    book: BookWithStats;
    reason: string;
  }>;
  activeLoans: LoanRecord[];
  onSelectBook: (book: BookWithStats) => void;
}

export function PopularRecommendations({
  popularBooks,
  personalizedRecommendations,
  activeLoans,
  onSelectBook,
}: PopularRecommendationsProps) {
  return (
    <section id="populer" className="py-12 lg:py-16 border-b border-[#E5DFD3] bg-[#F4F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C]">
              Pilihan Pembaca & Kurator
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] text-balance">
              Rekomendasi Buku Populer
            </h2>
          </div>
          <p className="text-sm text-[#57534E] max-w-md">
            Disusun berdasarkan frekuensi peminjaman komunitas, skor ulasan pembaca, dan tingkat penyelesaian bacaan.
          </p>
        </div>

        {/* Top 4 Popular Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {popularBooks.map((book, index) => {
            const isBorrowed = activeLoans.some((l) => l.bookId === book.id);
            return (
              <article
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group cursor-pointer flex flex-col bg-[#F9F7F3] border border-[#E2DACD] p-4 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-xs text-[#78716C] mb-3">
                  <span className="font-mono tabular-nums font-medium text-[#1B4332]">
                    0{index + 1}. Terpopuler
                  </span>
                  <span className="tabular-nums">{book.borrowCount} pinjaman</span>
                </div>

                <BookCover book={book} />

                <div className="mt-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-[#78716C]">
                    <span className="truncate">{book.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#1C1917] font-medium tabular-nums shrink-0">
                      <Star className="w-3.5 h-3.5 fill-[#B45309] text-[#B45309]" />
                      {book.averageRating.toFixed(1)}
                    </span>
                  </div>

                  <h3 className="mt-1.5 font-serif text-lg font-semibold text-[#1C1917] leading-snug group-hover:text-[#1B4332] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#57534E] mt-0.5">{book.author}</p>

                  <p className="mt-2.5 text-xs text-[#57534E] leading-relaxed line-clamp-2">
                    {book.curatorialNote}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E5DFD3] text-xs">
                    <span className="text-[#57534E] tabular-nums">
                      {isBorrowed
                        ? 'Sedang Anda pinjam'
                        : book.availableCopies > 0
                          ? `${book.availableCopies} salinan tersedia`
                          : 'Antrean penuh'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#1B4332]">
                      Detail <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Personalized Recommendations Based on Reading History */}
        {personalizedRecommendations.length > 0 && (
          <div className="mt-12 pt-10 border-t border-[#DED6C8]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                Disarankan Berdasarkan Riwayat Bacaan Anda
              </h3>
              <span className="text-xs text-[#57534E]">
                Dipersonalisasi dari kategori buku yang telah Anda baca
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {personalizedRecommendations.map(({ book, reason }) => {
                const isBorrowed = activeLoans.some((l) => l.bookId === book.id);
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="text-left flex gap-4 p-4 bg-[#F9F7F3] border border-[#E2DACD] hover:border-[#1B4332]/50 transition-colors cursor-pointer"
                  >
                    <div className="w-20 shrink-0">
                      <BookCover book={book} showSpineTitle={false} />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                        <span className="truncate">{book.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums shrink-0">
                          {book.averageRating.toFixed(1)} ★
                        </span>
                      </div>
                      <h4 className="mt-1 font-serif text-base font-semibold text-[#1C1917] leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-xs text-[#57534E]">{book.author}</p>
                      <p className="mt-2 text-xs text-[#1B4332] leading-relaxed">
                        {reason}
                      </p>
                      <span className="mt-auto pt-2 text-xs font-medium text-[#57534E]">
                        {isBorrowed
                          ? 'Sedang dipinjam'
                          : `${book.availableCopies} dari ${book.totalCopies} tersedia`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
