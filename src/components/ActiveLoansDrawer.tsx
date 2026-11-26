import { BookOpen, RotateCcw, X } from 'lucide-react';
import type { BookWithStats, LoanRecord } from '../types';
import { formatDateId, formatRelativeDue } from '../utils/format';
import { BookCover } from './BookCover';

interface ActiveLoansDrawerProps {
  isOpen: boolean;
  books: BookWithStats[];
  activeLoans: LoanRecord[];
  maxActiveLoans: number;
  onClose: () => void;
  onOpenReader: (book: BookWithStats, loan: LoanRecord) => void;
  onReturnLoan: (loanId: string) => Promise<void>;
  onRenewLoan: (loanId: string) => Promise<void>;
  busyLoanId: string | null;
}

export function ActiveLoansDrawer({
  isOpen,
  books,
  activeLoans,
  maxActiveLoans,
  onClose,
  onOpenReader,
  onReturnLoan,
  onRenewLoan,
  busyLoanId,
}: ActiveLoansDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loans-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/45"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#F9F7F3] border-l border-[#DDD5C7] h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E5DFD3] flex items-center justify-between">
          <div>
            <h2 id="loans-drawer-title" className="font-serif text-xl font-semibold text-[#1C1917]">
              Rak Pinjaman Aktif
            </h2>
            <p className="text-xs text-[#57534E] tabular-nums">
              {activeLoans.length} dari {maxActiveLoans} kuota pinjaman digunakan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup rak pinjaman"
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeLoans.length === 0 ? (
            <div className="py-12 text-center border border-[#E5DFD3] bg-[#F4F0E8] px-4">
              <p className="font-serif text-base text-[#1C1917]">
                Rak pinjaman Anda masih kosong.
              </p>
              <p className="mt-1 text-xs text-[#57534E]">
                Pilih buku dari katalog atau rekomendasi populer untuk mulai meminjam.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan) => {
                const book = books.find((b) => b.id === loan.bookId);
                if (!book) return null;
                const dueInfo = formatRelativeDue(loan.dueDate);
                const progressPercent = Math.min(
                  100,
                  Math.round((loan.currentPage / book.pages) * 100)
                );
                const isBusy = busyLoanId === loan.id;

                return (
                  <div
                    key={loan.id}
                    className="p-4 bg-white border border-[#E5DFD3] flex flex-col gap-4"
                  >
                    <div className="flex gap-3.5">
                      <div className="w-16 shrink-0">
                        <BookCover book={book} showSpineTitle={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold ${
                            dueInfo.isOverdue
                              ? 'text-[#9A3412]'
                              : dueInfo.isDueSoon
                                ? 'text-[#B45309]'
                                : 'text-[#1B4332]'
                          }`}
                        >
                          {dueInfo.label} · {formatDateId(loan.dueDate)}
                        </p>
                        <h3 className="mt-0.5 font-serif text-base font-semibold text-[#1C1917] leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#57534E]">{book.author}</p>

                        <div className="mt-2.5">
                          <div className="flex justify-between text-[11px] text-[#57534E] mb-1">
                            <span>Progres</span>
                            <span className="font-mono tabular-nums">
                              {loan.currentPage}/{book.pages} hlm ({progressPercent}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#EFEAE0]">
                            <div
                              className="h-full bg-[#1B4332]"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EFEAE0]">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenReader(book, loan);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Baca</span>
                      </button>

                      {loan.renewedCount < 2 && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onRenewLoan(loan.id)}
                          className="inline-flex items-center gap-1 py-2 px-3 text-xs font-medium text-[#1C1917] bg-[#F4F0E8] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>+7 Hari</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onReturnLoan(loan.id)}
                        className="py-2 px-3 text-xs font-medium text-[#9A3412] bg-[#FAF3EE] hover:bg-[#F3E5DA] border border-[#E5CBB8] rounded-md cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {isBusy ? '...' : 'Kembalikan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
