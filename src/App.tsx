import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActiveLoansDrawer } from './components/ActiveLoansDrawer';
import { BookDetailModal } from './components/BookDetailModal';
import { CatalogSection } from './components/CatalogSection';
import { CommunityReviewsSection } from './components/CommunityReviewsSection';
import { DigitalReaderModal } from './components/DigitalReaderModal';
import { HeroSection } from './components/HeroSection';
import { NotificationsSection } from './components/NotificationsSection';
import { PopularRecommendations } from './components/PopularRecommendations';
import { ReadingHistorySection } from './components/ReadingHistorySection';
import { TopBar } from './components/TopBar';
import type { BookWithStats, LibraryPayload, NotificationSettings } from './types';

export default function App() {
  const [library, setLibrary] = useState<LibraryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('beranda');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [readerState, setReaderState] = useState<{ bookId: string; loanId: string } | null>(
    null
  );
  const [loansDrawerOpen, setLoansDrawerOpen] = useState(false);
  const [busyBookId, setBusyBookId] = useState<string | null>(null);
  const [busyLoanId, setBusyLoanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, tone: 'success' | 'error' = 'success') => {
    setToast({ text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchLibrary = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('Gagal memuat data perpustakaan.');
      const data = (await res.json()) as LibraryPayload;
      setLibrary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat perpustakaan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLibrary();
  }, [fetchLibrary]);

  async function postAction(url: string, body?: unknown): Promise<LibraryPayload> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(typeof data?.error === 'string' ? data.error : 'Operasi gagal dijalankan.');
    }
    const payload = data as LibraryPayload;
    setLibrary(payload);
    return payload;
  }

  function handleNavigate(sectionId: string) {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function handleBorrowBook(bookId: string, durationDays: 7 | 14) {
    setBusyBookId(bookId);
    try {
      await postAction(`/api/books/${bookId}/borrow`, { durationDays });
      showToast(`Peminjaman berhasil selama ${durationDays} hari. Buku siap dibaca.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal meminjam buku.', 'error');
    } finally {
      setBusyBookId(null);
    }
  }

  async function handleReturnLoan(loanId: string) {
    setBusyLoanId(loanId);
    try {
      await postAction(`/api/loans/${loanId}/return`);
      if (readerState?.loanId === loanId) {
        setReaderState(null);
      }
      showToast('Buku berhasil dikembalikan. Riwayat bacaan Anda telah diperbarui.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengembalikan buku.', 'error');
    } finally {
      setBusyLoanId(null);
    }
  }

  async function handleRenewLoan(loanId: string) {
    setBusyLoanId(loanId);
    try {
      await postAction(`/api/loans/${loanId}/renew`);
      showToast('Masa pinjam berhasil diperpanjang 7 hari.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperpanjang pinjaman.', 'error');
    } finally {
      setBusyLoanId(null);
    }
  }

  async function handleUpdateProgress(loanId: string, currentPage: number) {
    setBusyLoanId(loanId);
    try {
      await postAction(`/api/loans/${loanId}/progress`, { currentPage });
      showToast(`Progres bacaan diperbarui ke halaman ${currentPage}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui progres.', 'error');
    } finally {
      setBusyLoanId(null);
    }
  }

  async function handleSubmitReview(
    bookId: string,
    rating: number,
    comment: string,
    reviewerName: string
  ) {
    await postAction(`/api/books/${bookId}/reviews`, {
      rating,
      comment,
      reviewerName,
    });
    showToast('Terima kasih! Ulasan komunitas Anda telah diterbitkan.');
  }

  async function handleToggleHelpful(reviewId: string) {
    try {
      await postAction(`/api/reviews/${reviewId}/helpful`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui suara.', 'error');
    }
  }

  async function handleMarkNotificationRead(id: string) {
    try {
      await postAction(`/api/notifications/${id}/read`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menandai notifikasi.', 'error');
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await postAction('/api/notifications/read-all');
      showToast('Semua notifikasi ditandai sudah dibaca.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menandai notifikasi.', 'error');
    }
  }

  async function handleUpdateNotificationSettings(settings: NotificationSettings) {
    try {
      await postAction('/api/notifications/settings', settings);
      showToast('Pengaturan pengingat pengembalian disimpan.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.', 'error');
    }
  }

  const activeLoans = useMemo(
    () => (library ? library.loans.filter((l) => l.status === 'active') : []),
    [library]
  );

  const unreadNotifications = useMemo(
    () => (library ? library.notifications.filter((n) => !n.read) : []),
    [library]
  );

  const urgentNotifications = useMemo(
    () =>
      library
        ? library.notifications.filter(
            (n) => !n.read && (n.severity === 'overdue' || n.severity === 'due_soon')
          )
        : [],
    [library]
  );

  const totalPagesRead = useMemo(
    () => (library ? library.loans.reduce((sum, l) => sum + l.currentPage, 0) : 0),
    [library]
  );

  const selectedBook: BookWithStats | undefined = useMemo(
    () => (library && selectedBookId ? library.books.find((b) => b.id === selectedBookId) : undefined),
    [library, selectedBookId]
  );

  const readerBook = useMemo(
    () => (library && readerState ? library.books.find((b) => b.id === readerState.bookId) : undefined),
    [library, readerState]
  );

  const readerLoan = useMemo(
    () => (library && readerState ? library.loans.find((l) => l.id === readerState.loanId) : undefined),
    [library, readerState]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-[#1C1917]">Pustaka Aksara</p>
          <p className="mt-2 text-sm text-[#57534E]">Menyiapkan katalog dan rak pinjaman Anda...</p>
        </div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center px-6">
        <div className="max-w-md w-full p-8 bg-white border border-[#DDD5C7] text-center">
          <h1 className="font-serif text-xl font-semibold text-[#1C1917]">
            Perpustakaan Tidak Dapat Dimuat
          </h1>
          <p className="mt-2 text-sm text-[#57534E]">
            {error ?? 'Terjadi gangguan saat menghubungi peladen perpustakaan.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void fetchLibrary();
            }}
            className="mt-5 px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] rounded-md cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F3] text-[#1C1917]">
      <TopBar
        activeSection={activeSection}
        activeLoanCount={activeLoans.length}
        unreadNotificationCount={unreadNotifications.length}
        onNavigate={handleNavigate}
        onOpenLoansDrawer={() => setLoansDrawerOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          readerName={library.profile.name}
          memberId={library.profile.memberId}
          totalBooks={library.books.length}
          activeLoanCount={activeLoans.length}
          maxActiveLoans={library.profile.maxActiveLoans}
          totalPagesRead={totalPagesRead}
          totalReviews={library.reviews.length}
          urgentNotifications={urgentNotifications}
          onExploreCatalog={() => handleNavigate('katalog')}
          onExplorePopular={() => handleNavigate('populer')}
          onOpenNotifications={() => handleNavigate('notifikasi')}
        />

        <PopularRecommendations
          popularBooks={library.popularBooks}
          personalizedRecommendations={library.personalizedRecommendations}
          activeLoans={activeLoans}
          onSelectBook={(book) => setSelectedBookId(book.id)}
        />

        <CatalogSection
          books={library.books}
          activeLoans={activeLoans}
          onSelectBook={(book) => setSelectedBookId(book.id)}
          onBorrowBook={handleBorrowBook}
          onOpenReader={(book, loan) => setReaderState({ bookId: book.id, loanId: loan.id })}
          busyBookId={busyBookId}
        />

        <ReadingHistorySection
          books={library.books}
          loans={library.loans}
          onOpenReader={(book, loan) => setReaderState({ bookId: book.id, loanId: loan.id })}
          onReturnLoan={handleReturnLoan}
          onRenewLoan={handleRenewLoan}
          onUpdateProgress={handleUpdateProgress}
          onSelectBook={(book) => setSelectedBookId(book.id)}
          busyLoanId={busyLoanId}
        />

        <NotificationsSection
          notifications={library.notifications}
          settings={library.notificationSettings}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onUpdateSettings={handleUpdateNotificationSettings}
          onReturnLoan={handleReturnLoan}
          onRenewLoan={handleRenewLoan}
          busyLoanId={busyLoanId}
        />

        <CommunityReviewsSection
          reviews={library.reviews}
          books={library.books}
          onSelectBook={(book) => setSelectedBookId(book.id)}
          onToggleHelpful={handleToggleHelpful}
        />
      </main>

      <footer className="bg-[#EFEAE0] border-t border-[#DDD5C7] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-sm text-[#57534E]">
          <div>
            <p className="font-serif text-lg font-semibold text-[#1C1917]">Pustaka Aksara</p>
            <p className="mt-1 text-xs">
              Perpustakaan digital terbuka untuk peminjaman daring, pelacakan bacaan, dan diskusi komunitas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a
              href="#katalog"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('katalog');
              }}
              className="hover:text-[#1C1917]"
            >
              Katalog
            </a>
            <a
              href="#populer"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('populer');
              }}
              className="hover:text-[#1C1917]"
            >
              Rekomendasi Populer
            </a>
            <a
              href="#riwayat"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('riwayat');
              }}
              className="hover:text-[#1C1917]"
            >
              Riwayat Bacaan
            </a>
            <a
              href="#notifikasi"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('notifikasi');
              }}
              className="hover:text-[#1C1917]"
            >
              Notifikasi Pengembalian
            </a>
          </div>
        </div>
      </footer>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          reviews={library.reviews.filter((r) => r.bookId === selectedBook.id)}
          activeLoan={activeLoans.find((l) => l.bookId === selectedBook.id)}
          readerName={library.profile.name}
          onClose={() => setSelectedBookId(null)}
          onBorrow={handleBorrowBook}
          onReturn={handleReturnLoan}
          onRenew={handleRenewLoan}
          onOpenReader={(book, loan) => {
            setSelectedBookId(null);
            setReaderState({ bookId: book.id, loanId: loan.id });
          }}
          onSubmitReview={handleSubmitReview}
          onToggleHelpful={handleToggleHelpful}
          isBusy={
            busyBookId === selectedBook.id ||
            Boolean(
              activeLoans.find((l) => l.bookId === selectedBook.id)?.id === busyLoanId && busyLoanId
            )
          }
        />
      )}

      {readerBook && readerLoan && (
        <DigitalReaderModal
          book={readerBook}
          loan={readerLoan}
          onClose={() => setReaderState(null)}
          onSaveProgress={handleUpdateProgress}
        />
      )}

      <ActiveLoansDrawer
        isOpen={loansDrawerOpen}
        books={library.books}
        activeLoans={activeLoans}
        maxActiveLoans={library.profile.maxActiveLoans}
        onClose={() => setLoansDrawerOpen(false)}
        onOpenReader={(book, loan) => setReaderState({ bookId: book.id, loanId: loan.id })}
        onReturnLoan={handleReturnLoan}
        onRenewLoan={handleRenewLoan}
        busyLoanId={busyLoanId}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 text-sm font-medium border shadow-lg ${
            toast.tone === 'error'
              ? 'bg-[#FAF3EE] text-[#9A3412] border-[#E5CBB8]'
              : 'bg-[#1B4332] text-white border-[#143326]'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
