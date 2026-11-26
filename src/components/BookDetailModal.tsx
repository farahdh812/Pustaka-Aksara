import { useState } from 'react';
import { BookOpen, RotateCcw, Star, ThumbsUp, X } from 'lucide-react';
import type { BookReview, BookWithStats, LoanRecord } from '../types';
import { formatDateId, formatRelativeDue } from '../utils/format';
import { BookCover } from './BookCover';

interface BookDetailModalProps {
  book: BookWithStats;
  reviews: BookReview[];
  activeLoan: LoanRecord | undefined;
  readerName: string;
  onClose: () => void;
  onBorrow: (bookId: string, durationDays: 7 | 14) => Promise<void>;
  onReturn: (loanId: string) => Promise<void>;
  onRenew: (loanId: string) => Promise<void>;
  onOpenReader: (book: BookWithStats, loan: LoanRecord) => void;
  onSubmitReview: (bookId: string, rating: number, comment: string, reviewerName: string) => Promise<void>;
  onToggleHelpful: (reviewId: string) => Promise<void>;
  isBusy: boolean;
}

export function BookDetailModal({
  book,
  reviews,
  activeLoan,
  readerName,
  onClose,
  onBorrow,
  onReturn,
  onRenew,
  onOpenReader,
  onSubmitReview,
  onToggleHelpful,
  isBusy,
}: BookDetailModalProps) {
  const [durationDays, setDurationDays] = useState<7 | 14>(7);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(readerName);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const dueInfo = activeLoan ? formatRelativeDue(activeLoan.dueDate) : null;

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReviewError(null);
    if (comment.trim().length < 10) {
      setReviewError('Tuliskan ulasan minimal 10 karakter agar bermanfaat bagi pembaca lain.');
      return;
    }
    setSubmittingReview(true);
    try {
      await onSubmitReview(book.id, rating, comment.trim(), reviewerName.trim() || readerName);
      setComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Gagal mengirim ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#F9F7F3] border border-[#DDD5C7] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#F9F7F3]/95 backdrop-blur-sm border-b border-[#E5DFD3]">
          <div className="flex items-center gap-2 text-xs text-[#78716C] min-w-0">
            <span className="font-mono">{book.accessionNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{book.category}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail buku"
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* 2-Column Book Presentation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <BookCover book={book} />

              {/* Accession Metadata Grid */}
              <dl className="mt-5 border-t border-[#E5DFD3] divide-y divide-[#E5DFD3] text-xs">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#78716C]">ISBN</dt>
                  <dd className="font-mono tabular-nums text-[#1C1917]">{book.isbn}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#78716C]">Penerbit</dt>
                  <dd className="text-[#1C1917] text-right">{book.publisher}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#78716C]">Tahun Terbit</dt>
                  <dd className="font-mono tabular-nums text-[#1C1917]">{book.year}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#78716C]">Tebal</dt>
                  <dd className="font-mono tabular-nums text-[#1C1917]">{book.pages} halaman</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#78716C]">Ketersediaan</dt>
                  <dd className="font-mono tabular-nums text-[#1C1917]">
                    {book.availableCopies} / {book.totalCopies} salinan
                  </dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-8 flex flex-col">
              <h2
                id="book-detail-title"
                className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] leading-tight text-balance"
              >
                {book.title}
              </h2>
              <p className="mt-1.5 text-base text-[#57534E]">{book.author}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
                <span className="inline-flex items-center gap-1 font-medium text-[#1C1917] tabular-nums">
                  <Star className="w-4 h-4 fill-[#B45309] text-[#B45309]" />
                  {book.averageRating.toFixed(1)} / 5.0
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{book.reviewCount} ulasan komunitas</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{book.borrowCount} kali dipinjam</span>
              </div>

              <p className="mt-5 text-sm sm:text-base text-[#1C1917] leading-relaxed">
                {book.synopsis}
              </p>

              <p className="mt-4 p-4 bg-[#F1EDE4] border border-[#E2DACD] text-xs sm:text-sm text-[#57534E] leading-relaxed">
                <strong className="text-[#1C1917] font-semibold">Catatan Kurator:</strong>{' '}
                {book.curatorialNote}
              </p>

              {/* Contiguous Borrowing Module */}
              <div className="mt-6 p-5 bg-white border border-[#DDD5C7]">
                {activeLoan ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <p className="text-xs text-[#78716C]">Status Pinjaman Anda</p>
                        <p
                          className={`text-sm font-semibold mt-0.5 ${
                            dueInfo?.isOverdue
                              ? 'text-[#9A3412]'
                              : dueInfo?.isDueSoon
                                ? 'text-[#B45309]'
                                : 'text-[#1B4332]'
                          }`}
                        >
                          Aktif · {dueInfo?.label} ({formatDateId(activeLoan.dueDate)})
                        </p>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-[#57534E]">
                        Halaman {activeLoan.currentPage} / {book.pages}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenReader(book, activeLoan)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Buka Ruang Baca Digital</span>
                      </button>

                      {activeLoan.renewedCount < 2 && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onRenew(activeLoan.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#1C1917] bg-[#F4F0E8] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Perpanjang +7 Hari</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onReturn(activeLoan.id)}
                        className="px-4 py-2.5 text-sm font-medium text-[#9A3412] bg-[#FAF3EE] hover:bg-[#F3E5DA] border border-[#E5CBB8] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? 'Memproses...' : 'Kembalikan Buku'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#78716C]">Pilih Durasi Peminjaman Daring</p>
                        <div className="mt-2 inline-flex p-1 bg-[#EFEAE0] rounded-md gap-1">
                          {([7, 14] as const).map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setDurationDays(days)}
                              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                                durationDays === days
                                  ? 'bg-white text-[#1C1917] shadow-xs'
                                  : 'text-[#57534E] hover:text-[#1C1917]'
                              }`}
                            >
                              {days} Hari
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={book.availableCopies <= 0 || isBusy}
                        onClick={() => onBorrow(book.id, durationDays)}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] disabled:bg-[#D6CEBE] disabled:text-[#57534E] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isBusy
                          ? 'Memproses Peminjaman...'
                          : book.availableCopies > 0
                            ? `Pinjam Sekarang (${durationDays} Hari)`
                            : 'Salinan Sedang Habis'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Community Reviews Section */}
              <div className="mt-8 pt-8 border-t border-[#E5DFD3]">
                <div className="flex items-baseline justify-between mb-5">
                  <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                    Ulasan Komunitas ({reviews.length})
                  </h3>
                  <span className="text-xs text-[#78716C] tabular-nums">
                    Rata-rata {book.averageRating.toFixed(1)} dari 5
                  </span>
                </div>

                {/* Write Review Form */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-5 bg-[#F4F0E8] border border-[#E2DACD] mb-6"
                >
                  <p className="text-sm font-semibold text-[#1C1917]">
                    Bagikan Ulasan Anda
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1" role="group" aria-label="Pilih rating bintang">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          aria-label={`${starValue} bintang`}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              starValue <= rating
                                ? 'fill-[#B45309] text-[#B45309]'
                                : 'text-[#C2B8A3]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Nama Anda"
                      aria-label="Nama pengulas"
                      className="px-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded text-[#1C1917] w-48"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tuliskan kesan bacaan, bagian favorit, atau siapa yang cocok membaca buku ini..."
                    className="mt-3 w-full px-3 py-2 text-sm bg-white border border-[#DDD5C7] rounded text-[#1C1917] placeholder:text-[#78716C]"
                  />

                  {reviewError && (
                    <p className="mt-2 text-xs font-medium text-[#9A3412]">{reviewError}</p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? 'Mengirim...' : 'Terbitkan Ulasan'}
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#57534E]">
                    Belum ada ulasan untuk buku ini. Jadilah pembaca pertama yang menulis ulasan.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E5DFD3] border border-[#E5DFD3] bg-white">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-semibold text-[#1C1917]">
                                {review.reviewerName}
                              </span>
                              {review.verifiedReader && (
                                <>
                                  <span aria-hidden="true" className="text-[#78716C]">
                                    ·
                                  </span>
                                  <span className="text-[#1B4332] font-medium">
                                    Pembaca Terverifikasi
                                  </span>
                                </>
                              )}
                              <span aria-hidden="true" className="text-[#78716C]">
                                ·
                              </span>
                              <span className="text-[#78716C] tabular-nums">
                                {formatDateId(review.createdAt)}
                              </span>
                            </div>

                            <div className="mt-1.5 flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  className={`w-3.5 h-3.5 ${
                                    n <= review.rating
                                      ? 'fill-[#B45309] text-[#B45309]'
                                      : 'text-[#E5DFD3]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleHelpful(review.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded transition-colors cursor-pointer whitespace-nowrap ${
                              review.helpfulByUser
                                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                                : 'bg-[#F9F7F3] text-[#57534E] border-[#DDD5C7] hover:text-[#1C1917]'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="tabular-nums">Membantu ({review.helpfulCount})</span>
                          </button>
                        </div>

                        <p className="mt-2.5 text-sm text-[#1C1917] leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
