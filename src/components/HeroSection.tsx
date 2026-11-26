import { useState } from 'react';
import { ArrowRight, BellRing, X } from 'lucide-react';
import type { ReturnNotification } from '../types';

interface HeroSectionProps {
  readerName: string;
  memberId: string;
  totalBooks: number;
  activeLoanCount: number;
  maxActiveLoans: number;
  totalPagesRead: number;
  totalReviews: number;
  urgentNotifications: ReturnNotification[];
  onExploreCatalog: () => void;
  onExplorePopular: () => void;
  onOpenNotifications: () => void;
}

export function HeroSection({
  readerName,
  memberId,
  totalBooks,
  activeLoanCount,
  maxActiveLoans,
  totalPagesRead,
  totalReviews,
  urgentNotifications,
  onExploreCatalog,
  onExplorePopular,
  onOpenNotifications,
}: HeroSectionProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);

  const topUrgent = urgentNotifications[0];

  return (
    <section id="beranda" className="border-b border-[#E5DFD3] bg-[#F9F7F3]">
      {/* Slim dismissible return notification ribbon when urgent alerts exist */}
      {topUrgent && !bannerDismissed && (
        <div className="border-b border-[#E5DFD3] bg-[#F3ECE1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <BellRing className="w-4 h-4 shrink-0 text-[#9A3412]" />
              <p className="text-[#1C1917] truncate">
                <span className="font-semibold text-[#9A3412]">{topUrgent.label}:</span>{' '}
                <span>{topUrgent.title}</span>
                {urgentNotifications.length > 1 && (
                  <span className="text-[#57534E]">
                    {' '}
                    (+{urgentNotifications.length - 1} pengingat lain)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenNotifications}
                className="font-semibold text-[#1B4332] hover:underline whitespace-nowrap cursor-pointer"
              >
                Kelola Pengembalian
              </button>
              <button
                type="button"
                aria-label="Tutup pengingat"
                onClick={() => setBannerDismissed(true)}
                className="p-1 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* 2-Column Editorial Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] mb-4">
              <span>Ruang Baca Anggota</span>
              <span aria-hidden="true">·</span>
              <span>{readerName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{memberId}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight text-[#1C1917] leading-[1.12] text-balance">
              Pinjam buku secara daring, rawat jejak bacaan Anda.
            </h1>

            <p className="mt-5 text-base sm:text-[17px] text-[#57534E] leading-relaxed max-w-xl">
              Jelajahi koleksi sastra, sains, arsitektur, dan sejarah pilihan. Baca langsung di ruang baca digital, pantau progres halaman, terima pengingat jatuh tempo otomatis, dan bertukar ulasan dengan komunitas pembaca.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Jelajahi Katalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExplorePopular}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#1C1917] bg-[#F1EDE4] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Rekomendasi Populer</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-full min-h-[260px] overflow-hidden border border-[#DDD5C7] bg-[#EBE6DF]">
              {!heroImgError ? (
                <img
                  src="/src/assets/images/hero_library_reading_1795675835170.jpg"
                  alt="Ruang baca perpustakaan digital Pustaka Aksara dengan rak kayu oak dan meja baca yang diterangi cahaya pagi"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#EBE6DF] text-[#57534E]">
                  <p className="font-serif text-xl text-[#1C1917]">Ruang Baca Pustaka Aksara</p>
                  <p className="text-sm mt-1">Koleksi Digital Terkurasi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width 4-Column Operational Utility Strip */}
        <div className="mt-10 pt-8 border-t border-[#E5DFD3] grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <p className="text-xs text-[#78716C]">Koleksi Terkurasi</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-[#1C1917] tabular-nums">
              {totalBooks} Judul
            </p>
            <p className="mt-0.5 text-xs text-[#57534E]">Siap dipinjam daring 7–14 hari</p>
          </div>

          <div>
            <p className="text-xs text-[#78716C]">Pinjaman Aktif</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-[#1C1917] tabular-nums">
              {activeLoanCount} / {maxActiveLoans} Buku
            </p>
            <p className="mt-0.5 text-xs text-[#57534E]">Dapat diperpanjang 2 kali</p>
          </div>

          <div>
            <p className="text-xs text-[#78716C]">Jejak Bacaan Anda</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-[#1C1917] tabular-nums">
              {totalPagesRead.toLocaleString('id-ID')} Halaman
            </p>
            <p className="mt-0.5 text-xs text-[#57534E]">Tercatat di riwayat bacaan</p>
          </div>

          <div>
            <p className="text-xs text-[#78716C]">Ulasan Komunitas</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-[#1C1917] tabular-nums">
              {totalReviews} Ulasan
            </p>
            <p className="mt-0.5 text-xs text-[#57534E]">Dari pembaca terverifikasi</p>
          </div>
        </div>
      </div>
    </section>
  );
}
