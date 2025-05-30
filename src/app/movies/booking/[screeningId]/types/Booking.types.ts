export interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: (wasDeleted: boolean) => void;
  reservationId: string | null;
  movieTitle: string;
  screeningTime: string;
  seats: string[];
  totalPrice: number;
  ticketSummary: string;
}

export interface UserInfo {
  email: string;
  phoneNumber: string;
  name: string;
}

export type PaymentMethod = 'swish' | 'card' | 'atCinema';

export interface BookingDetailsProps {
  movie: {
    title: string;
    posterUrl: string;
    genre: string[];
    durationMinutes: number;
    ageLimit: number;
  };
  screening: {
    screeningTime: string;
    auditorium: string;
  };
}

export interface Screening {
  _id: string;
  movieId: string;
  screeningTime: string;
  auditorium: string;
  status: string;
}

export interface Movie {
  title: string;
  posterUrl: string;
  genre: string[];
  durationMinutes: number;
  ageLimit: number;
  slug: string;
}

export interface BookingManagerProps {
  screeningId: string;
}
