import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import type { BookWithStats, LoanRecord } from '../types';
import { formatDateId, formatRelativeDue } from '../utils/format';
import { BookCover } from './BookCover';

interface ReadingHistorySectionProps {
  books: BookWithStats[];
  loans: LoanRecord[];
  onOpenReader: (book: BookWithStats, loan: LoanRecord) => void;
  onReturnLoan: (loanId: string) => Promise<void>;
  onRenewLoan: (loanId: string) => Promise<void>;
  onUpdateProgress: (loanId: string, currentPage: number) => Promise<void>;
  onSelectBook: (book: BookWithStats) => void;
  busyLoanId: string | null;
}

type HistoryFilter = 'all' | 'active' | 'completed' | 'returned';

export function ReadingHistorySection({
  books,
  loans,
  onOpenReader,
  onReturnLoan,
  onRenewLoan,
  onUpdateProgress,
  onSelectBook,
  busyLoanId,
}: ReadingHistorySectionProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [draftPage, setDraftPage] = useState<number>(1);

  const enrichedLoans = useMemo(() => {
    return loans
      .map((loan) => {
        const book = books.find((b) => b.id === loan.bookId);
        if (!book) return null;
        const progressPercent = Math.min(100, Math.round((loan.currentPage / book.pages) * 100));
        const isCompleted = progressPercent >= 100;
        return { loan, book, progressPercent, isCompleted };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [loans, books]);

  const filteredLoans = useMemo(() => {
    return enrichedLoans.filter((item) => {
      if (filter === 'active') return item.loan.status === 'active';
      if (filter === 'completed') return item.isCompleted;
      if (filter === 'returned') return item.loan.status === 'returned';
      return true;
    });
  }, [enrichedLoans, filter]);

  const stats = useMemo(() => {
    const activeCount = enrichedLoans.filter((i) => i.loan.status === 'active').length;
    const completedCount = enrichedLoans.filter((i) => i.isCompleted).length;
    const totalPages = enrichedLoans.reduce((sum, i) => sum + i.loan.currentPage, 0);
    return { activeCount, completedCount, totalPages };
  }, [enrichedLoans]);

  return (
    <section id="riwayat" className="py-12 lg:py-16 border-b border-[#E5DFD3] bg-[#F9F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C]">
              Pelacakan Progres & Log Pinjaman
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Riwayat Bacaan & Pinjaman
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-xs text-[#78716C] block">Sedang Dipinjam</span>
              <span className="font-mono font-medium text-[#1C1917] tabular-nums">
                {stats.activeCount} buku
              </span>
            </div>
            <div className="h-8 w-px bg-[#E5DFD3]" aria-hidden="true" />
            <div>
              <span className="text-xs text-[#78716C] block">Tamat Dibaca</span>
              <span className="font-mono font-medium text-[#1C1917] tabular-nums">
                {stats.completedCount} buku
              </span>
            </div>
            <div className="h-8 w-px bg-[#E5DFD3]" aria-hidden="true" />
            <div>
              <span className="text-xs text-[#78716C] block">Total Halaman</span>
              <span className="font-mono font-medium text-[#1C1917] tabular-nums">
                {stats.totalPages.toLocaleString('id-ID')} hlm
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFEAE0] rounded-md w-fit mb-6">
          {(
            [
              { id: 'all', label: `Semua (${enrichedLoans.length})` },
              { id: 'active', label: `Sedang Dipinjam (${stats.activeCount})` },
              { id: 'completed', label: `Selesai Dibaca (${stats.completedCount})` },
              {
                id: 'returned',
                label: `Sudah Dikembalikan (${enrichedLoans.length - stats.activeCount})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reading History List */}
        {filteredLoans.length === 0 ? (
          <div className="p-10 text-center border border-[#E5DFD3] bg-[#F4F0E8]">
            <p className="font-serif text-lg text-[#1C1917]">
              Belum ada catatan pada filter ini.
            </p>
            <p className="mt-1 text-sm text-[#57534E]">
              Pinjam buku dari katalog untuk mulai melacak riwayat bacaan Anda.
            </p>
          </div>
        ) : (
          <div className="border border-[#E5DFD3] bg-white divide-y divide-[#E5DFD3]">
            {filteredLoans.map(({ loan, book, progressPercent, isCompleted }) => {
              const dueInfo = formatRelativeDue(loan.dueDate);
              const isBusy = busyLoanId === loan.id;
              const isEditing = editingLoanId === loan.id;

              return (
                <div
                  key={loan.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-6"
                >
                  {/* Cover + Metadata */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectBook(book)}
                      className="w-16 sm:w-20 shrink-0 cursor-pointer text-left"
                    >
                      <BookCover book={book} showSpineTitle={false} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C]">
                        <span>{book.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Dipinjam {formatDateId(loan.borrowedAt)}</span>
                        <span aria-hidden="true">·</span>
                        {loan.status === 'active' ? (
                          <span
                            className={`font-medium inline-flex items-center gap-1 ${
                              dueInfo.isOverdue
                                ? 'text-[#9A3412]'
                                : dueInfo.isDueSoon
                                  ? 'text-[#B45309]'
                                  : 'text-[#1B4332]'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {dueInfo.label} ({formatDateId(loan.dueDate)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#57534E]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                            Dikembalikan {loan.returnedAt ? formatDateId(loan.returnedAt) : ''}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="mt-1 text-left cursor-pointer"
                      >
                        <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917] hover:text-[#1B4332] transition-colors">
                          {book.title}
                        </h3>
                      </button>
                      <p className="text-xs sm:text-sm text-[#57534E]">{book.author}</p>

                      {/* Progress Bar & Inline Editor */}
                      <div className="mt-4 max-w-md">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[#57534E]">
                            Progres Bacaan{' '}
                            {isCompleted ? '(Selesai)' : loan.status === 'active' ? '(Aktif)' : ''}
                          </span>
                          <span className="font-mono tabular-nums font-medium text-[#1C1917]">
                            {loan.currentPage} / {book.pages} hlm ({progressPercent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#EFEAE0] overflow-hidden">
                          <div
                            className="h-full bg-[#1B4332] transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {isEditing && (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              await onUpdateProgress(loan.id, draftPage);
                              setEditingLoanId(null);
                            }}
                            className="mt-3 flex flex-wrap items-center gap-2"
                          >
                            <label className="text-xs text-[#57534E]" htmlFor={`page-${loan.id}`}>
                              Halaman saat ini:
                            </label>
                            <input
                              id={`page-${loan.id}`}
                              type="number"
                              min={1}
                              max={book.pages}
                              value={draftPage}
                              onChange={(e) => setDraftPage(Number(e.target.value))}
                              className="w-20 px-2 py-1 text-xs font-mono tabular-nums border border-[#DDD5C7] rounded bg-[#F9F7F3]"
                            />
                            <button
                              type="submit"
                              disabled={isBusy}
                              className="px-3 py-1 text-xs font-medium text-white bg-[#1B4332] rounded cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingLoanId(null)}
                              className="px-2.5 py-1 text-xs text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                            >
                              Batal
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {loan.status === 'active' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenReader(book, loan)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Baca Sekarang</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingLoanId(isEditing ? null : loan.id);
                            setDraftPage(loan.currentPage);
                          }}
                          className="px-3 py-2 text-xs font-medium text-[#1C1917] bg-[#F4F0E8] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Catat Halaman
                        </button>

                        {loan.renewedCount < 2 && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onRenewLoan(loan.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#1C1917] bg-white hover:bg-[#F4F0E8] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Perpanjang +7 Hari</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onReturnLoan(loan.id)}
                          className="px-3 py-2 text-xs font-medium text-[#9A3412] bg-[#FAF3EE] hover:bg-[#F3E5DA] border border-[#E5CBB8] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                        >
                          {isBusy ? 'Memproses...' : 'Kembalikan'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="px-4 py-2 text-xs font-medium text-[#1C1917] bg-[#F4F0E8] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Pinjam Ulang / Beri Ulasan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
