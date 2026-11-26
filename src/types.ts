export interface BookChapter {
  number: number;
  title: string;
  content: string[];
}

export interface Book {
  id: string;
  isbn: string;
  accessionNumber: string;
  title: string;
  author: string;
  category: 'Fiksi Sastra' | 'Arsitektur & Budaya' | 'Sains & Kosmos' | 'Filsafat & Esai' | 'Sejarah';
  year: number;
  pages: number;
  publisher: string;
  language: string;
  coverImage: string | null;
  clothColor: string;
  clothAccent: string;
  synopsis: string;
  curatorialNote: string;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  chapters: BookChapter[];
}

export interface LoanRecord {
  id: string;
  bookId: string;
  borrowerName: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  renewedCount: number;
  status: 'active' | 'returned';
  currentPage: number;
  lastReadAt: string;
}

export interface BookReview {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedReader: boolean;
  helpfulCount: number;
  helpfulByUser?: boolean;
}

export type NotificationSeverity = 'overdue' | 'due_soon' | 'upcoming' | 'info' | 'success';

export interface ReturnNotification {
  id: string;
  loanId?: string;
  bookId: string;
  bookTitle: string;
  severity: NotificationSeverity;
  label: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionable: boolean;
}

export interface NotificationSettings {
  remindThreeDaysBefore: boolean;
  remindOneDayBefore: boolean;
  overdueDailyDigest: boolean;
}

export interface ReaderProfile {
  name: string;
  memberId: string;
  maxActiveLoans: number;
}

export interface BookWithStats extends Book {
  averageRating: number;
  reviewCount: number;
  popularityScore: number;
}

export interface LibraryPayload {
  profile: ReaderProfile;
  books: BookWithStats[];
  loans: LoanRecord[];
  reviews: BookReview[];
  notifications: ReturnNotification[];
  notificationSettings: NotificationSettings;
  popularBooks: BookWithStats[];
  personalizedRecommendations: Array<{
    book: BookWithStats;
    reason: string;
  }>;
}
