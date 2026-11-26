import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Book,
  BookReview,
  BookWithStats,
  LibraryPayload,
  LoanRecord,
  NotificationSettings,
  ReaderProfile,
  ReturnNotification,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const DB_PATH = path.join(DATA_DIR, 'library-db.json');
const PORT = Number(process.env.PORT) || 3000;

interface StoredDatabase {
  profile: ReaderProfile;
  books: Book[];
  loans: LoanRecord[];
  reviews: BookReview[];
  eventNotifications: ReturnNotification[];
  readDynamicNotificationIds: string[];
  notificationSettings: NotificationSettings;
}

function addDays(base: Date, days: number): string {
  const result = new Date(base.getTime());
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

function createInitialDatabase(): StoredDatabase {
  const now = new Date();

  const books: Book[] = [
    {
      id: 'jejak-hujan-di-muara',
      isbn: '978-623-8104-12-7',
      accessionNumber: 'PA.2024.018',
      title: 'Jejak Hujan di Muara',
      author: 'Nadia Pramesti',
      category: 'Fiksi Sastra',
      year: 2024,
      pages: 312,
      publisher: 'Penerbit Lentera Aksara',
      language: 'Indonesia',
      coverImage: '/src/assets/images/cover_jejak_hujan_1795675834554.jpg',
      clothColor: '#2D4A3E',
      clothAccent: '#D8E2DC',
      synopsis:
        'Kisah seorang kartografer sungai yang menyusuri kembali muara-muara tua di pesisir barat Kalimantan demi menyusun peta ingatan keluarganya yang hilang bersama banjir besar tahun 1984.',
      curatorialNote:
        'Terpilih sebagai novel sastra paling banyak dipinjam sepanjang kuartal ini karena prosa puitisnya tentang ekologi sungai dan memori lintas generasi.',
      totalCopies: 6,
      availableCopies: 4,
      borrowCount: 164,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Perahu Kertas di Dermaga Kayu',
          content: [
            'Hujan di hulu selalu datang lebih dulu sebelum kabarnya sampai ke dermaga. Pada pukul lima pagi, permukaan Sungai Kapuas berubah warna menjadi tembaga pucat, membawa ranting rotan dan bau tanah basah dari perbukitan pedalaman.',
            'Raka meletakkan gulungan peta tua di atas meja kayu ulin. Tinta biru yang digambar ayahnya empat dekade lalu mulai memudar di tepian lipatan, namun garis-garis anak sungai masih terbaca jelas seperti urat nadi di punggung tangan.',
            'Di kota pelabuhan kecil ini, orang-orang mengukur waktu bukan dari jarum jam, melainkan dari pasang surut air dan bunyi peluit kapal kayu yang bersandar sebelum senja turun.',
          ],
        },
        {
          number: 2,
          title: 'Bab 2: Arsip yang Terendam',
          content: [
            'Gedung arsip kecamatan berdiri di atas tiang-tiang besi tua yang separuhnya diselimuti lumut air. Setiap musim penghujan, lemari berkas di lantai dasar dipindahkan ke loteng dengan katrol tali rami.',
            'Di dalam peti timah bernomor 14, Raka menemukan tiga buku catatan lapangan berisi sketsa rumah lanting, daftar nama juru mudi, dan selembar foto berbingkai kertas tipis yang sudutnya terbakar matahari.',
            'Setiap nama yang tertulis di pinggir halaman terasa seperti undangan untuk menelusuri kembali percakapan yang terputus oleh jarak dan waktu.',
          ],
        },
        {
          number: 3,
          title: 'Bab 3: Peta untuk Hari Esok',
          content: [
            'Menjelang minggu ketiga perjalanan, buku sketsa Raka telah penuh dengan catatan pasang surut, sketsa jembatan gantung, dan cerita lisan para penambang sampan.',
            'Ia menyadari bahwa peta terbaik bukan sekadar gambar tentang letak daratan dan kedalaman air, melainkan catatan tentang bagaimana manusia bertahan dan saling menjaga di tepian arus.',
          ],
        },
      ],
    },
    {
      id: 'peta-langit-nusantara',
      isbn: '978-623-7419-08-2',
      accessionNumber: 'PA.2025.004',
      title: 'Peta Langit Nusantara',
      author: 'Dr. Hendra Kusuma',
      category: 'Sains & Kosmos',
      year: 2025,
      pages: 286,
      publisher: 'Balai Pustaka Sains',
      language: 'Indonesia',
      coverImage: '/src/assets/images/cover_peta_langit_1795675836280.jpg',
      clothColor: '#1E3A5F',
      clothAccent: '#E9C46A',
      synopsis:
        'Eksplorasi mendalam tentang sejarah astronomi maritim di kepulauan Nusantara, mulai dari pembacaan rasi bintang oleh pelaut Bugis hingga observatorium modern di khatulistiwa.',
      curatorialNote:
        'Rekomendasi utama pembaca kategori sains populer dengan tingkat penyelesaian baca tertinggi di Pustaka Aksara.',
      totalCopies: 5,
      availableCopies: 5,
      borrowCount: 152,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Kompas Bintang di Khatulistiwa',
          content: [
            'Berada tepat di garis ekuator memberikan keistimewaan optik yang langka: hampir seluruh belahan langit utara dan selatan dapat diamati dalam siklus satu tahun penuh dari titik pengamatan yang sama.',
            'Bagi para pelaut tradisional Nusantara, langit malam bukan sekadar hamparan titik cahaya, melainkan kalender musim angin dan peta navigasi terbuka tanpa batas daratan.',
            'Rasi Layang-Layang Selatan dan Gugus Bintang Tujuh menjadi penanda kapan layar pinisi dibentangkan menuju timur dan kapan perahu harus berlindung di teluk tenang.',
          ],
        },
        {
          number: 2,
          title: 'Bab 2: Astrolab dan Jam Pasir',
          content: [
            'Pertemuan jalur perdagangan rempah membawa instrumen kuningan seperti astrolab dan kuadran ke pelabuhan-pelabuhan niaga di Sumatra, Jawa, dan Maluku.',
            'Dengan mengukur ketinggian bintang kutub atau matahari pada tengah hari, juru mudi dapat memperkirakan garis lintang pelayaran bahkan ketika garis pantai telah menghilang di cakrawala.',
          ],
        },
      ],
    },
    {
      id: 'arsitektur-kayu-ruang-teduh',
      isbn: '978-602-5910-44-1',
      accessionNumber: 'PA.2023.112',
      title: 'Arsitektur Kayu & Ruang Teduh',
      author: 'Raden Bagus Wirawan',
      category: 'Arsitektur & Budaya',
      year: 2023,
      pages: 248,
      publisher: 'Serambi Ruang Press',
      language: 'Indonesia',
      coverImage: '/src/assets/images/cover_arsitektur_kayu_1795675835639.jpg',
      clothColor: '#5C4033',
      clothAccent: '#EAE0D5',
      synopsis:
        'Monograf visual dan teknis tentang sistem sambungan kayu tanpa paku, sirkulasi angin silang, dan tata cahaya alami pada bangunan tropis Nusantara.',
      curatorialNote:
        'Koleksi wajib bagi peminat desain ruang, arsitektur berkelanjutan, dan pelestarian kriya kayu tradisional.',
      totalCopies: 4,
      availableCopies: 3,
      borrowCount: 129,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Logika Sambungan Pasak',
          content: [
            'Keunggulan bangunan kayu tradisional terletak pada elastisitas sambungannya. Alih-alih mengunci balok secara kaku dengan paku besi, tukang kayu merancang lidah, alur, dan pasak yang membiarkan struktur bernapas mengikuti getaran tanah dan perubahan kelembapan.',
            'Di bawah atap bertritisan lebar, cahaya matahari tropis yang tajam disaring terlebih dahulu melalui kisi-kisi beranda sebelum menyentuh ruang dalam yang sejuk.',
          ],
        },
        {
          number: 2,
          title: 'Bab 2: Halaman Dalam sebagai Paru-Paru Rumah',
          content: [
            'Ruang terbuka di tengah bangunan berfungsi layaknya cerobong alami yang melepaskan udara hangat ke atas sambil menarik hawa sejuk dari taman teduh di sekitarnya.',
          ],
        },
      ],
    },
    {
      id: 'etika-sunyi-zaman-bising',
      isbn: '978-623-9022-31-9',
      accessionNumber: 'PA.2024.073',
      title: 'Etika Sunyi di Zaman Bising',
      author: 'Siti Rahmawati',
      category: 'Filsafat & Esai',
      year: 2024,
      pages: 198,
      publisher: 'Pustaka Narasi',
      language: 'Indonesia',
      coverImage: '/src/assets/images/cover_etika_sunyi_1795675836753.jpg',
      clothColor: '#8C4A32',
      clothAccent: '#F3E9DC',
      synopsis:
        'Kumpulan dua belas esai reflektif tentang seni merawat perhatian, membaca secara mendalam, dan membangun jeda bermakna di tengah banjir informasi digital.',
      curatorialNote:
        'Esai paling banyak diulas oleh komunitas pembaca sepanjang bulan ini dengan skor kepuasan tinggi.',
      totalCopies: 5,
      availableCopies: 3,
      borrowCount: 141,
      chapters: [
        {
          number: 1,
          title: 'Esai 1: Hak Atas Keheningan',
          content: [
            'Kebisingan modern jarang hadir dalam bentuk suara keras; ia datang sebagai tuntutan perhatian yang terpecah setiap tiga puluh detik. Kita terbiasa menukar kedalaman pikiran dengan kecepatan tanggapan.',
            'Membaca buku panjang adalah tindakan perlawanan yang sunyi. Ia melatih pikiran untuk tinggal di satu gagasan cukup lama hingga makna aslinya mengendap.',
          ],
        },
        {
          number: 2,
          title: 'Esai 2: Perpustakaan sebagai Ruang Publik Terakhir',
          content: [
            'Di antara sedikit ruang kota yang tidak meminta kita membeli sesuatu untuk boleh duduk tenang, perpustakaan tetap menjadi benteng kesetaraan pengetahuan.',
          ],
        },
      ],
    },
    {
      id: 'surat-surat-pelabuhan-lama',
      isbn: '978-602-4418-77-3',
      accessionNumber: 'PA.2022.055',
      title: 'Surat-Surat dari Pelabuhan Lama',
      author: 'Arif Budiman',
      category: 'Sejarah',
      year: 2022,
      pages: 340,
      publisher: 'Kalam Pustaka',
      language: 'Indonesia',
      coverImage: null,
      clothColor: '#7C3626',
      clothAccent: '#E7D8C9',
      synopsis:
        'Rekonstruksi sejarah sosial kota-kota pelabuhan abad ke-19 melalui korespondensi para syahbandar, penerjemah naskah, dan pedagang rempah.',
      curatorialNote:
        'Arsip sejarah primer yang dirangkai seperti kisah detektif yang memikat dari halaman pertama.',
      totalCopies: 4,
      availableCopies: 4,
      borrowCount: 98,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Tinta Besi di Atas Kertas Eropa',
          content: [
            'Setiap kapal yang berlabuh di bandar niaga meninggalkan lebih dari sekadar muatan lada dan kayu manis; ia meninggalkan daftar manifes, surat utang, dan kabar keluarga dari seberang lautan.',
            'Melalui arsip surat-menyurat tersebut, kita mendengar suara keseharian warga pelabuhan yang jarang tercatat dalam buku sejarah resmi.',
          ],
        },
      ],
    },
    {
      id: 'algoritma-alam-simetri-bunga',
      isbn: '978-623-5112-09-5',
      accessionNumber: 'PA.2025.019',
      title: 'Algoritma Alam & Simetri Bunga',
      author: 'Larasati Dewi',
      category: 'Sains & Kosmos',
      year: 2025,
      pages: 224,
      publisher: 'Balai Pustaka Sains',
      language: 'Indonesia',
      coverImage: null,
      clothColor: '#1B4332',
      clothAccent: '#D8F3DC',
      synopsis:
        'Pengantar jernih mengenai pola fraktal, deret Fibonacci pada kelopak tumbuhan, dan matematika di balik pertumbuhan terumbu karang.',
      curatorialNote:
        'Sangat direkomendasikan bagi pembaca yang menyukai perpaduan sains visual dan keindahan alam.',
      totalCopies: 5,
      availableCopies: 4,
      borrowCount: 112,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Geometri yang Tumbuh Pelan',
          content: [
            'Alam tidak pernah menggambar dengan penggaris, namun setiap daun pakis, pusaran cangkang nautilus, dan susunan biji bunga matahari mengikuti prinsip efisiensi energi yang sangat presisi.',
            'Ketika sebuah tunas baru tumbuh pada sudut emas 137,5 derajat, ia memastikan setiap helai daun memperoleh jatah cahaya matahari tanpa saling menutupi.',
          ],
        },
      ],
    },
    {
      id: 'senja-di-kota-pelabuhan',
      isbn: '978-602-8812-65-8',
      accessionNumber: 'PA.2023.089',
      title: 'Senja di Kota Pelabuhan',
      author: 'Bima Prakoso',
      category: 'Fiksi Sastra',
      year: 2023,
      pages: 276,
      publisher: 'Penerbit Lentera Aksara',
      language: 'Indonesia',
      coverImage: null,
      clothColor: '#263859',
      clothAccent: '#DBE2EF',
      synopsis:
        'Novel tentang seorang pembuat jam tua dan cucunya yang berupaya menyelamatkan menara lonceng kota tua sebelum kawasan pesisir direklamasi.',
      curatorialNote:
        'Pilihan populer pembaca fiksi kontemporer yang menyukai latar kota bersejarah.',
      totalCopies: 3,
      availableCopies: 2,
      borrowCount: 118,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Detak Roda Gigi Kuningan',
          content: [
            'Menara jam di ujung Jalan Niaga tidak pernah benar-benar berhenti sejak tahun 1928, kecuali selama tiga hari pada musim kemarau panjang ketika minyak pelumas mengental.',
            'Setiap Kamis sore, Kakek Darmo menaiki seratus dua belas anak tangga kayu untuk memeriksa pegas utama sambil memandang kapal tanker melintas di kejauhan.',
          ],
        },
      ],
    },
    {
      id: 'catatan-kurator-museum',
      isbn: '978-623-6109-44-0',
      accessionNumber: 'PA.2024.101',
      title: 'Catatan Kurator Museum',
      author: 'Maya Kartika',
      category: 'Arsitektur & Budaya',
      year: 2024,
      pages: 210,
      publisher: 'Serambi Ruang Press',
      language: 'Indonesia',
      coverImage: null,
      clothColor: '#6B5B3E',
      clothAccent: '#F5EFE6',
      synopsis:
        'Di balik layar perawatan naskah kuno, tata pencahayaan ruang pamer, dan cara sebuah benda bersejarah bercerita kepada generasi masa kini.',
      curatorialNote:
        'Bacaan ringkas yang memikat bagi pencinta museum, literasi arsip, dan desain pameran.',
      totalCopies: 4,
      availableCopies: 4,
      borrowCount: 89,
      chapters: [
        {
          number: 1,
          title: 'Bab 1: Cahaya yang Tidak Merusak Tinta',
          content: [
            'Merawat manuskrip berumur tiga abad berarti bernegosiasi dengan cahaya. Pengunjung membutuhkan penerangan cukup untuk membaca aksara halus, sementara kertas tua menuntut keteduhan agar seratnya tidak rapuh.',
          ],
        },
      ],
    },
  ];

  const loans: LoanRecord[] = [
    {
      id: 'loan-seed-1',
      bookId: 'jejak-hujan-di-muara',
      borrowerName: 'Farah Dhiba',
      borrowedAt: addDays(now, -13),
      dueDate: addDays(now, 1), // Due tomorrow -> triggers H-1 notification
      returnedAt: null,
      renewedCount: 0,
      status: 'active',
      currentPage: 148,
      lastReadAt: addDays(now, -0.2),
    },
    {
      id: 'loan-seed-2',
      bookId: 'etika-sunyi-zaman-bising',
      borrowerName: 'Farah Dhiba',
      borrowedAt: addDays(now, -16),
      dueDate: addDays(now, -2), // Overdue 2 days -> triggers overdue notification
      returnedAt: null,
      renewedCount: 0,
      status: 'active',
      currentPage: 170,
      lastReadAt: addDays(now, -1),
    },
    {
      id: 'loan-seed-3',
      bookId: 'peta-langit-nusantara',
      borrowerName: 'Farah Dhiba',
      borrowedAt: addDays(now, -22),
      dueDate: addDays(now, -8),
      returnedAt: addDays(now, -9),
      renewedCount: 0,
      status: 'returned',
      currentPage: 286,
      lastReadAt: addDays(now, -9),
    },
    {
      id: 'loan-seed-4',
      bookId: 'arsitektur-kayu-ruang-teduh',
      borrowerName: 'Farah Dhiba',
      borrowedAt: addDays(now, -35),
      dueDate: addDays(now, -21),
      returnedAt: addDays(now, -22),
      renewedCount: 1,
      status: 'returned',
      currentPage: 195,
      lastReadAt: addDays(now, -22),
    },
  ];

  const reviews: BookReview[] = [
    {
      id: 'rev-1',
      bookId: 'jejak-hujan-di-muara',
      reviewerName: 'Dimas Pratama',
      rating: 5,
      comment:
        'Penggambaran suasana sungai dan ruang arsipnya begitu hidup. Setiap bab terasa seperti berjalan menyusuri dermaga pagi hari sambil membuka album foto lama.',
      createdAt: addDays(now, -4),
      verifiedReader: true,
      helpfulCount: 18,
    },
    {
      id: 'rev-2',
      bookId: 'jejak-hujan-di-muara',
      reviewerName: 'Niken Ayuningtyas',
      rating: 5,
      comment:
        'Alurnya tenang namun menghanyutkan. Sangat cocok dibaca di akhir pekan ketika butuh cerita yang hangat dan reflektif.',
      createdAt: addDays(now, -10),
      verifiedReader: true,
      helpfulCount: 11,
    },
    {
      id: 'rev-3',
      bookId: 'peta-langit-nusantara',
      reviewerName: 'Farah Dhiba',
      rating: 5,
      comment:
        'Penjelasan tentang cara pelaut Nusantara membaca rasi bintang mudah dipahami bahkan untuk pembaca awam astronomi. Ilustrasi dan catatan sejarahnya sangat rapi.',
      createdAt: addDays(now, -9),
      verifiedReader: true,
      helpfulCount: 24,
    },
    {
      id: 'rev-4',
      bookId: 'peta-langit-nusantara',
      reviewerName: 'Bagus Santoso',
      rating: 4,
      comment:
        'Riset sejarah maritimnya kuat sekali. Bagian tentang astrolab di pelabuhan rempah membuka perspektif baru tentang sains di kepulauan.',
      createdAt: addDays(now, -14),
      verifiedReader: true,
      helpfulCount: 9,
    },
    {
      id: 'rev-5',
      bookId: 'etika-sunyi-zaman-bising',
      reviewerName: 'Rina Wijaya',
      rating: 5,
      comment:
        'Esai-esainya singkat tetapi menohok. Membantu saya mengevaluasi ulang kebiasaan membaca cepat dan mulai menyediakan waktu sunyi setiap malam.',
      createdAt: addDays(now, -3),
      verifiedReader: true,
      helpfulCount: 31,
    },
    {
      id: 'rev-6',
      bookId: 'arsitektur-kayu-ruang-teduh',
      reviewerName: 'Teguh Prasetyo',
      rating: 5,
      comment:
        'Membahas teknik pasak kayu dengan bahasa yang jernih. Sangat bermanfaat sebagai referensi desain hunian tropis yang sejuk tanpa pendingin berlebih.',
      createdAt: addDays(now, -17),
      verifiedReader: true,
      helpfulCount: 15,
    },
    {
      id: 'rev-7',
      bookId: 'algoritma-alam-simetri-bunga',
      reviewerName: 'Sari Wulandari',
      rating: 5,
      comment:
        'Mengubah cara saya memandang tanaman di halaman rumah. Penjelasan sudut emas dan pola fraktal dijelaskan dengan contoh sehari-hari.',
      createdAt: addDays(now, -6),
      verifiedReader: true,
      helpfulCount: 14,
    },
    {
      id: 'rev-8',
      bookId: 'senja-di-kota-pelabuhan',
      reviewerName: 'Andika Nugraha',
      rating: 4,
      comment:
        'Kisah yang hangat tentang menjaga warisan kota tua di tengah perubahan zaman. Karakter Kakek Darmo terasa sangat dekat.',
      createdAt: addDays(now, -12),
      verifiedReader: true,
      helpfulCount: 7,
    },
  ];

  const eventNotifications: ReturnNotification[] = [
    {
      id: 'notif-seed-return-1',
      loanId: 'loan-seed-3',
      bookId: 'peta-langit-nusantara',
      bookTitle: 'Peta Langit Nusantara',
      severity: 'success',
      label: 'Pengembalian Berhasil',
      title: 'Buku telah dikembalikan tepat waktu',
      message: 'Terima kasih telah mengembalikan "Peta Langit Nusantara" (100% selesai dibaca). Ulasan Anda sudah terbit di komunitas.',
      createdAt: addDays(now, -9),
      read: true,
      actionable: false,
    },
  ];

  return {
    profile: {
      name: 'Farah Dhiba',
      memberId: 'PA-2026-0812',
      maxActiveLoans: 5,
    },
    books,
    loans,
    reviews,
    eventNotifications,
    readDynamicNotificationIds: [],
    notificationSettings: {
      remindThreeDaysBefore: true,
      remindOneDayBefore: true,
      overdueDailyDigest: true,
    },
  };
}

function loadDatabase(): StoredDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as StoredDatabase;
  } catch {
    const fallback = createInitialDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveDatabase(db: StoredDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function buildLibraryPayload(db: StoredDatabase): LibraryPayload {
  const now = new Date();

  const booksWithStats: BookWithStats[] = db.books.map((book) => {
    const bookReviews = db.reviews.filter((r) => r.bookId === book.id);
    const reviewCount = bookReviews.length;
    const averageRating =
      reviewCount > 0
        ? Number(
            (bookReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
          )
        : 4.5;
    const popularityScore = Number(
      (book.borrowCount * 0.65 + averageRating * 22 + reviewCount * 4).toFixed(1)
    );
    return {
      ...book,
      averageRating,
      reviewCount,
      popularityScore,
    };
  });

  const popularBooks = [...booksWithStats]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 4);

  // Personalized recommendations based on user's reading history categories, excluding currently active or already read if possible
  const readBookIds = new Set(db.loans.map((l) => l.bookId));
  const preferredCategories = new Map<string, string>();
  for (const loan of db.loans) {
    const book = booksWithStats.find((b) => b.id === loan.bookId);
    if (book && !preferredCategories.has(book.category)) {
      preferredCategories.set(book.category, book.title);
    }
  }

  const personalizedRecommendations: Array<{ book: BookWithStats; reason: string }> = [];
  for (const book of [...booksWithStats].sort((a, b) => b.popularityScore - a.popularityScore)) {
    if (readBookIds.has(book.id)) continue;
    const matchedTitle = preferredCategories.get(book.category);
    if (matchedTitle) {
      personalizedRecommendations.push({
        book,
        reason: `Selaras dengan riwayat bacaan Anda pada "${matchedTitle}" (${book.category})`,
      });
    }
  }
  // Fill up to 3 recommendations if needed
  for (const book of [...booksWithStats].sort((a, b) => b.popularityScore - a.popularityScore)) {
    if (personalizedRecommendations.length >= 3) break;
    if (
      !readBookIds.has(book.id) &&
      !personalizedRecommendations.some((rec) => rec.book.id === book.id)
    ) {
      personalizedRecommendations.push({
        book,
        reason: `Pilihan editor di kategori ${book.category} dengan ${book.borrowCount} peminjaman`,
      });
    }
  }

  // Build dynamic due-date notifications from active loans
  const dynamicNotifications: ReturnNotification[] = [];
  for (const loan of db.loans) {
    if (loan.status !== 'active') continue;
    const book = db.books.find((b) => b.id === loan.bookId);
    if (!book) continue;

    const due = new Date(loan.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && db.notificationSettings.overdueDailyDigest) {
      const overdueDays = Math.abs(diffDays);
      const id = `dyn-overdue-${loan.id}`;
      dynamicNotifications.push({
        id,
        loanId: loan.id,
        bookId: book.id,
        bookTitle: book.title,
        severity: 'overdue',
        label: `Terlambat ${overdueDays} Hari`,
        title: `Batas pengembalian "${book.title}" telah lewat`,
        message: `Masa pinjam berakhir ${overdueDays} hari yang lalu. Segera kembalikan buku atau perpanjang durasi pinjam selama 7 hari.`,
        createdAt: loan.dueDate,
        read: db.readDynamicNotificationIds.includes(id),
        actionable: true,
      });
    } else if (diffDays >= 0 && diffDays <= 1 && db.notificationSettings.remindOneDayBefore) {
      const id = `dyn-duesoon-${loan.id}`;
      dynamicNotifications.push({
        id,
        loanId: loan.id,
        bookId: book.id,
        bookTitle: book.title,
        severity: 'due_soon',
        label: diffDays === 0 ? 'Jatuh Tempo Hari Ini' : 'Jatuh Tempo Besok',
        title: `Pengingat pengembalian "${book.title}"`,
        message:
          diffDays === 0
            ? `Batas waktu peminjaman berakhir hari ini. Selesaikan bacaan Anda atau ajukan perpanjangan.`
            : `Masa pinjam tersisa 1 hari lagi. Anda dapat mengembalikan lebih awal atau memperpanjang 7 hari.`,
        createdAt: now.toISOString(),
        read: db.readDynamicNotificationIds.includes(id),
        actionable: true,
      });
    } else if (diffDays > 1 && diffDays <= 3 && db.notificationSettings.remindThreeDaysBefore) {
      const id = `dyn-upcoming-${loan.id}`;
      dynamicNotifications.push({
        id,
        loanId: loan.id,
        bookId: book.id,
        bookTitle: book.title,
        severity: 'upcoming',
        label: `Pengingat H-${diffDays}`,
        title: `Masa pinjam "${book.title}" tersisa ${diffDays} hari`,
        message: `Progres bacaan Anda saat ini ${Math.round((loan.currentPage / book.pages) * 100)}%. Jadwalkan waktu baca sebelum jatuh tempo.`,
        createdAt: now.toISOString(),
        read: db.readDynamicNotificationIds.includes(id),
        actionable: true,
      });
    }
  }

  const severityPriority: Record<string, number> = {
    overdue: 0,
    due_soon: 1,
    upcoming: 2,
    info: 3,
    success: 4,
  };

  const notifications = [...dynamicNotifications, ...db.eventNotifications].sort((a, b) => {
    const unreadDiff = Number(a.read) - Number(b.read);
    if (unreadDiff !== 0) return unreadDiff;
    const sevDiff = (severityPriority[a.severity] ?? 5) - (severityPriority[b.severity] ?? 5);
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedLoans = [...db.loans].sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
  );

  const sortedReviews = [...db.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    profile: db.profile,
    books: booksWithStats,
    loans: sortedLoans,
    reviews: sortedReviews,
    notifications,
    notificationSettings: db.notificationSettings,
    popularBooks,
    personalizedRecommendations,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Get full library state
  app.get('/api/library', (_req, res) => {
    const db = loadDatabase();
    res.json(buildLibraryPayload(db));
  });

  // Borrow a book
  app.post('/api/books/:id/borrow', (req, res) => {
    const db = loadDatabase();
    const book = db.books.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Buku tidak ditemukan.' });
      return;
    }

    const activeLoans = db.loans.filter((l) => l.status === 'active');
    if (activeLoans.some((l) => l.bookId === book.id)) {
      res.status(400).json({ error: 'Buku ini sedang Anda pinjam.' });
      return;
    }
    if (activeLoans.length >= db.profile.maxActiveLoans) {
      res.status(400).json({
        error: `Batas maksimal ${db.profile.maxActiveLoans} pinjaman aktif telah tercapai.`,
      });
      return;
    }
    if (book.availableCopies <= 0) {
      res.status(400).json({ error: 'Seluruh salinan buku sedang dipinjam.' });
      return;
    }

    const durationDays = req.body?.durationDays === 14 ? 14 : 7;
    const now = new Date();
    const dueDate = addDays(now, durationDays);

    book.availableCopies -= 1;
    book.borrowCount += 1;

    const newLoan: LoanRecord = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      borrowerName: db.profile.name,
      borrowedAt: now.toISOString(),
      dueDate,
      returnedAt: null,
      renewedCount: 0,
      status: 'active',
      currentPage: 1,
      lastReadAt: now.toISOString(),
    };

    db.loans.unshift(newLoan);
    db.eventNotifications.unshift({
      id: `notif-borrow-${Date.now()}`,
      loanId: newLoan.id,
      bookId: book.id,
      bookTitle: book.title,
      severity: 'info',
      label: 'Peminjaman Aktif',
      title: `Peminjaman "${book.title}" berhasil`,
      message: `Masa pinjam berlaku selama ${durationDays} hari. Pengingat otomatis akan dikirim sebelum jatuh tempo.`,
      createdAt: now.toISOString(),
      read: false,
      actionable: false,
    });

    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Return a borrowed book
  app.post('/api/loans/:id/return', (req, res) => {
    const db = loadDatabase();
    const loan = db.loans.find((l) => l.id === req.params.id);
    if (!loan || loan.status !== 'active') {
      res.status(404).json({ error: 'Data peminjaman aktif tidak ditemukan.' });
      return;
    }

    const book = db.books.find((b) => b.id === loan.bookId);
    const now = new Date();
    loan.status = 'returned';
    loan.returnedAt = now.toISOString();
    loan.lastReadAt = now.toISOString();

    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      db.eventNotifications.unshift({
        id: `notif-return-${Date.now()}`,
        loanId: loan.id,
        bookId: book.id,
        bookTitle: book.title,
        severity: 'success',
        label: 'Pengembalian Berhasil',
        title: `"${book.title}" telah dikembalikan`,
        message: `Progres bacaan terakhir (${Math.round((loan.currentPage / book.pages) * 100)}%) tersimpan di riwayat bacaan Anda. Bagikan ulasan untuk pembaca lain.`,
        createdAt: now.toISOString(),
        read: false,
        actionable: false,
      });
    }

    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Renew a borrowed book (+7 days)
  app.post('/api/loans/:id/renew', (req, res) => {
    const db = loadDatabase();
    const loan = db.loans.find((l) => l.id === req.params.id);
    if (!loan || loan.status !== 'active') {
      res.status(404).json({ error: 'Peminjaman aktif tidak ditemukan.' });
      return;
    }
    if (loan.renewedCount >= 2) {
      res.status(400).json({ error: 'Maksimal 2 kali perpanjangan untuk setiap pinjaman.' });
      return;
    }

    const book = db.books.find((b) => b.id === loan.bookId);
    const now = new Date();
    const currentDue = new Date(loan.dueDate);
    const baseForExtension = currentDue > now ? currentDue : now;
    loan.dueDate = addDays(baseForExtension, 7);
    loan.renewedCount += 1;

    if (book) {
      db.eventNotifications.unshift({
        id: `notif-renew-${Date.now()}`,
        loanId: loan.id,
        bookId: book.id,
        bookTitle: book.title,
        severity: 'info',
        label: 'Perpanjangan Disetujui',
        title: `Masa pinjam "${book.title}" diperpanjang 7 hari`,
        message: `Batas pengembalian baru diperpanjang. Selamat melanjutkan bacaan Anda.`,
        createdAt: now.toISOString(),
        read: false,
        actionable: false,
      });
    }

    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Update reading progress
  app.post('/api/loans/:id/progress', (req, res) => {
    const db = loadDatabase();
    const loan = db.loans.find((l) => l.id === req.params.id);
    if (!loan) {
      res.status(404).json({ error: 'Riwayat pinjaman tidak ditemukan.' });
      return;
    }
    const book = db.books.find((b) => b.id === loan.bookId);
    if (!book) {
      res.status(404).json({ error: 'Buku tidak ditemukan.' });
      return;
    }

    const rawPage = Number(req.body?.currentPage);
    if (!Number.isFinite(rawPage)) {
      res.status(400).json({ error: 'Nomor halaman tidak valid.' });
      return;
    }

    loan.currentPage = Math.max(1, Math.min(book.pages, Math.round(rawPage)));
    loan.lastReadAt = new Date().toISOString();

    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Post a community review
  app.post('/api/books/:id/reviews', (req, res) => {
    const db = loadDatabase();
    const book = db.books.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Buku tidak ditemukan.' });
      return;
    }

    const rating = Number(req.body?.rating);
    const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';
    const reviewerName =
      typeof req.body?.reviewerName === 'string' && req.body.reviewerName.trim()
        ? req.body.reviewerName.trim().slice(0, 60)
        : db.profile.name;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating harus antara 1 sampai 5 bintang.' });
      return;
    }
    if (comment.length < 10 || comment.length > 600) {
      res.status(400).json({ error: 'Ulasan harus terdiri dari 10 hingga 600 karakter.' });
      return;
    }

    const hasReadBook = db.loans.some((l) => l.bookId === book.id);
    const newReview: BookReview = {
      id: `rev-${Date.now()}`,
      bookId: book.id,
      reviewerName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verifiedReader: hasReadBook,
      helpfulCount: 0,
    };

    db.reviews.unshift(newReview);
    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Toggle helpful vote on review
  app.post('/api/reviews/:id/helpful', (req, res) => {
    const db = loadDatabase();
    const review = db.reviews.find((r) => r.id === req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Ulasan tidak ditemukan.' });
      return;
    }
    if (review.helpfulByUser) {
      review.helpfulByUser = false;
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulByUser = true;
      review.helpfulCount += 1;
    }
    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', (req, res) => {
    const db = loadDatabase();
    const id = req.params.id;
    if (id.startsWith('dyn-')) {
      if (!db.readDynamicNotificationIds.includes(id)) {
        db.readDynamicNotificationIds.push(id);
      }
    } else {
      const target = db.eventNotifications.find((n) => n.id === id);
      if (target) target.read = true;
    }
    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Mark all notifications as read
  app.post('/api/notifications/read-all', (_req, res) => {
    const db = loadDatabase();
    const payload = buildLibraryPayload(db);
    for (const notif of payload.notifications) {
      if (notif.id.startsWith('dyn-')) {
        if (!db.readDynamicNotificationIds.includes(notif.id)) {
          db.readDynamicNotificationIds.push(notif.id);
        }
      }
    }
    for (const notif of db.eventNotifications) {
      notif.read = true;
    }
    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Update notification settings
  app.post('/api/notifications/settings', (req, res) => {
    const db = loadDatabase();
    db.notificationSettings = {
      remindThreeDaysBefore: Boolean(req.body?.remindThreeDaysBefore),
      remindOneDayBefore: Boolean(req.body?.remindOneDayBefore),
      overdueDailyDigest: Boolean(req.body?.overdueDailyDigest),
    };
    saveDatabase(db);
    res.json(buildLibraryPayload(db));
  });

  // Serve Vite or static dist
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pustaka Aksara server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
