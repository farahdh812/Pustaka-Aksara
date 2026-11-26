interface TopBarProps {
  activeSection: string;
  activeLoanCount: number;
  unreadNotificationCount: number;
  onNavigate: (sectionId: string) => void;
  onOpenLoansDrawer: () => void;
}

export function TopBar({
  activeSection,
  activeLoanCount,
  unreadNotificationCount,
  onNavigate,
  onOpenLoansDrawer,
}: TopBarProps) {
  const navItems = [
    { id: 'katalog', label: 'Katalog' },
    { id: 'populer', label: 'Populer' },
    { id: 'riwayat', label: 'Riwayat Baca' },
    {
      id: 'notifikasi',
      label:
        unreadNotificationCount > 0
          ? `Notifikasi (${unreadNotificationCount})`
          : 'Notifikasi',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F3]/95 backdrop-blur-sm border-b border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#beranda"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('beranda');
          }}
          className="font-serif text-xl font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0"
        >
          Pustaka Aksara
        </a>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`py-1 border-b-2 transition-colors duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#1B4332] text-[#1C1917] font-semibold'
                    : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CEBE]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenLoansDrawer}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="tabular-nums">Rak Pinjaman ({activeLoanCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
