import { Star, ThumbsUp } from 'lucide-react';
import type { BookReview, BookWithStats } from '../types';
import { formatDateId } from '../utils/format';

interface CommunityReviewsSectionProps {
  reviews: BookReview[];
  books: BookWithStats[];
  onSelectBook: (book: BookWithStats) => void;
  onToggleHelpful: (reviewId: string) => Promise<void>;
}

export function CommunityReviewsSection({
  reviews,
  books,
  onSelectBook,
  onToggleHelpful,
}: CommunityReviewsSectionProps) {
  const featuredReviews = reviews.slice(0, 6);

  return (
    <section id="ulasan" className="py-12 lg:py-16 border-b border-[#E5DFD3] bg-[#F9F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C]">
              Suara Pembaca
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Ulasan Komunitas Terbaru
            </h2>
          </div>
          <p className="text-sm text-[#57534E] max-w-md">
            Catatan jujur dari anggota Pustaka Aksara setelah meminjam dan menuntaskan bacaan mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredReviews.map((review) => {
            const book = books.find((b) => b.id === review.bookId);
            if (!book) return null;

            return (
              <article
                key={review.id}
                className="flex flex-col justify-between p-5 bg-white border border-[#E5DFD3]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#78716C]">
                    <span className="font-semibold text-[#1C1917]">{review.reviewerName}</span>
                    <span className="tabular-nums">{formatDateId(review.createdAt)}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
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
                    {review.verifiedReader && (
                      <span className="text-[11px] text-[#1B4332] font-medium">
                        · Pembaca Terverifikasi
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-[#1C1917] leading-relaxed">
                    “{review.comment}”
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EFEAE0] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="text-left min-w-0 cursor-pointer group"
                  >
                    <span className="block text-[11px] text-[#78716C]">Mengulas buku</span>
                    <span className="block text-xs font-serif font-semibold text-[#1C1917] group-hover:text-[#1B4332] truncate">
                      {book.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleHelpful(review.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded transition-colors cursor-pointer shrink-0 ${
                      review.helpfulByUser
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-[#F9F7F3] text-[#57534E] border-[#DDD5C7] hover:text-[#1C1917]'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="tabular-nums">{review.helpfulCount}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
