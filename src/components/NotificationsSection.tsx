import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, Check, CheckCircle2, Clock } from 'lucide-react';
import type { NotificationSettings, ReturnNotification } from '../types';
import { formatDateId } from '../utils/format';

interface NotificationsSectionProps {
  notifications: ReturnNotification[];
  settings: NotificationSettings;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onUpdateSettings: (settings: NotificationSettings) => Promise<void>;
  onReturnLoan: (loanId: string) => Promise<void>;
  onRenewLoan: (loanId: string) => Promise<void>;
  busyLoanId: string | null;
}

type NotifFilter = 'all' | 'unread' | 'due';

export function NotificationsSection({
  notifications,
  settings,
  onMarkRead,
  onMarkAllRead,
  onUpdateSettings,
  onReturnLoan,
  onRenewLoan,
  busyLoanId,
}: NotificationsSectionProps) {
  const [filter, setFilter] = useState<NotifFilter>('all');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.read;
      if (filter === 'due') {
        return n.severity === 'overdue' || n.severity === 'due_soon' || n.severity === 'upcoming';
      }
      return true;
    });
  }, [notifications, filter]);

  function renderSeverityIcon(severity: ReturnNotification['severity']) {
    if (severity === 'overdue') {
      return <AlertTriangle className="w-4 h-4 text-[#9A3412] shrink-0" />;
    }
    if (severity === 'due_soon' || severity === 'upcoming') {
      return <Clock className="w-4 h-4 text-[#B45309] shrink-0" />;
    }
    if (severity === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0" />;
    }
    return <Bell className="w-4 h-4 text-[#57534E] shrink-0" />;
  }

  return (
    <section id="notifikasi" className="py-12 lg:py-16 border-b border-[#E5DFD3] bg-[#F4F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C]">
              Pengingat Jatuh Tempo & Aktivitas
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Pusat Notifikasi Pengembalian
            </h2>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1C1917] bg-white hover:bg-[#EFEAE0] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca ({unreadCount})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Notification Feed */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#E7E0D3] rounded-md w-fit mb-5">
              {(
                [
                  { id: 'all', label: `Semua (${notifications.length})` },
                  { id: 'unread', label: `Belum Dibaca (${unreadCount})` },
                  { id: 'due', label: 'Pengingat Jatuh Tempo' },
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

            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center bg-[#F9F7F3] border border-[#E2DACD]">
                <p className="font-serif text-lg text-[#1C1917]">
                  Tidak ada notifikasi pada kategori ini.
                </p>
                <p className="mt-1 text-sm text-[#57534E]">
                  Semua pengingat pengembalian dan aktivitas pinjaman Anda dalam keadaan rapi.
                </p>
              </div>
            ) : (
              <div className="bg-[#F9F7F3] border border-[#E2DACD] divide-y divide-[#E2DACD]">
                {filteredNotifications.map((notif) => {
                  const isBusy = Boolean(notif.loanId && busyLoanId === notif.loanId);
                  return (
                    <div
                      key={notif.id}
                      className={`p-5 transition-colors ${
                        notif.read ? 'bg-[#F9F7F3]' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5">{renderSeverityIcon(notif.severity)}</div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`font-semibold ${
                                  notif.severity === 'overdue'
                                    ? 'text-[#9A3412]'
                                    : notif.severity === 'due_soon' || notif.severity === 'upcoming'
                                      ? 'text-[#B45309]'
                                      : 'text-[#1B4332]'
                                }`}
                              >
                                {notif.label}
                              </span>
                              <span aria-hidden="true" className="text-[#78716C]">
                                ·
                              </span>
                              <span className="text-[#78716C] tabular-nums">
                                {formatDateId(notif.createdAt)}
                              </span>
                              {!notif.read && (
                                <>
                                  <span aria-hidden="true" className="text-[#78716C]">
                                    ·
                                  </span>
                                  <span className="font-medium text-[#1B4332]">Baru</span>
                                </>
                              )}
                            </div>

                            <h3 className="mt-1 font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
                              {notif.title}
                            </h3>
                            <p className="mt-1 text-sm text-[#57534E] leading-relaxed">
                              {notif.message}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2.5">
                              {notif.actionable && notif.loanId && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => onReturnLoan(notif.loanId!)}
                                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                                  >
                                    {isBusy ? 'Memproses...' : 'Kembalikan Sekarang'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => onRenewLoan(notif.loanId!)}
                                    className="px-3.5 py-1.5 text-xs font-medium text-[#1C1917] bg-[#F4F0E8] hover:bg-[#E7E0D3] border border-[#DDD5C7] rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                                  >
                                    Perpanjang +7 Hari
                                  </button>
                                </>
                              )}

                              {!notif.read && (
                                <button
                                  type="button"
                                  onClick={() => onMarkRead(notif.id)}
                                  className="px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  Tandai Dibaca
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notification Schedule Settings */}
          <aside className="lg:col-span-4 bg-[#F9F7F3] border border-[#E2DACD] p-6">
            <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
              Jadwal Pengingat Otomatis
            </h3>
            <p className="mt-1 text-xs text-[#57534E] leading-relaxed">
              Atur kapan sistem mengirimkan notifikasi pengembalian untuk setiap buku yang sedang Anda pinjam.
            </p>

            <div className="mt-5 space-y-4 divide-y divide-[#E5DFD3]">
              <label className="flex items-start justify-between gap-4 pt-1 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-[#1C1917] block">
                    Pengingat 3 Hari Sebelumnya
                  </span>
                  <span className="text-xs text-[#57534E]">
                    Pemberitahuan H-3 agar Anda sempat menyelesaikan bab terakhir.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.remindThreeDaysBefore}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      remindThreeDaysBefore: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 accent-[#1B4332] cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-4 pt-4 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-[#1C1917] block">
                    Pengingat H-1 & Hari Jatuh Tempo
                  </span>
                  <span className="text-xs text-[#57534E]">
                    Peringatan prioritas 24 jam sebelum masa pinjam berakhir.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.remindOneDayBefore}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      remindOneDayBefore: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 accent-[#1B4332] cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-4 pt-4 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-[#1C1917] block">
                    Notifikasi Keterlambatan
                  </span>
                  <span className="text-xs text-[#57534E]">
                    Tampilkan pengingat aktif hingga buku dikembalikan atau diperpanjang.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.overdueDailyDigest}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      overdueDailyDigest: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 accent-[#1B4332] cursor-pointer shrink-0"
                />
              </label>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
