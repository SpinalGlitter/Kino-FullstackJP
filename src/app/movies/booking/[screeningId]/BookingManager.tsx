'use client';

import { useEffect, useState, useCallback } from 'react';
import BookingDetails from './BookingDetails';
import ScreeningSelector from '@/components/movies/movie-details/ScreeningSelector';
import TicketSelector from './TicketSelector';
import CinemaSeating from './Seatings';
import Spinner from '@/components/Spinner';
import Button from '@/components/Button';
import Link from 'next/link';
import BookingConfirmationModal from './BookingConfirmationModal';
import { Seat } from './types/Seatings.types';
import { Movie, Screening } from './types/Booking.types';
import { BookingManagerProps } from './types/Booking.types';
import { useSession } from 'next-auth/react';

export default function BookingManager({ screeningId }: BookingManagerProps) {
  const session = useSession();
  let userId: string;
  if (session.status === 'authenticated') {
    userId = session.data.user.id;
  } else {
    userId = '';
  }
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);

  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [ticketSummary, setTicketSummary] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const [seatDetails, setSeatDetails] = useState<Map<string, { row: number; seatNumber: number }>>(new Map());
  const [refreshSeats, setRefreshSeats] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshSeatsData = useCallback(async () => {
    if (!selectedScreening) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/seats/${selectedScreening._id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      if (!response.ok) {
        throw new Error('Unable to refresh seats');
      }

      setRefreshSeats(prev => !prev);
    } catch (error) {
      console.error('Error refreshing seats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedScreening]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/movies/booking/${screeningId}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error('Not able to fetch booking data');
        return;
      }

      const data = await res.json();
      setSelectedScreening(data.screening);
      setScreenings(data.screenings);
      setMovie(data.movie);
    };

    fetchData();
  }, [screeningId]);

  useEffect(() => {
    const fetchSeatDetails = async () => {
      if (!selectedScreening || selectedSeats.length === 0) return;

      try {
        const response = await fetch(`/api/seats/${selectedScreening._id}`);

        if (!response.ok) {
          throw new Error('Could not fetch seat details');
        }
        const data = await response.json();

        const seatDetailsMap = new Map();
        data.forEach((seat: Seat) => {
          seatDetailsMap.set(seat._id, {
            row: seat.row,
            seatNumber: seat.seatNumber,
          });
        });
        setSeatDetails(seatDetailsMap);
      } catch (error) {
        console.error('error fetching seat', error);
      }
    };

    fetchSeatDetails();
  }, [selectedScreening, selectedSeats]);

  const handleSelectedSeatsChange = (seats: string[]) => {
    setSelectedSeats(seats);
  };

  const handleFinalPriceChange = (price: number) => {
    setFinalPrice(price);
  };

  const formatSeatLabels = (seatIds: string[]) => {
    return seatIds.map(id => {
      const details = seatDetails.get(id);
      return details ? `Row ${details.row}, Seat ${details.seatNumber}` : id;
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length !== totalTickets || totalTickets === 0) {
      alert('Choose as many seats as tickets please.');
      return;
    }
    setIsBooking(true);
    try {
      const response = await fetch(`/api/movies/booking/${screeningId}/reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screeningId: selectedScreening?._id,
          seats: selectedSeats,
          userId: userId !== '' ? userId : 'guest',
          totalPrice: finalPrice,
        }),
      });
      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const data = await response.json();
      setReservationId(data.reservationId);
      setIsModalOpen(true);
    } catch (error) {
      console.log('Booking error', error);
      alert('Error while booking');
    } finally {
      setIsBooking(false);
    }
  };
  const handleCloseModal = useCallback(
    async (wasDeleted: boolean) => {
      setIsModalOpen(false);

      setSelectedSeats([]);

      if (wasDeleted) {
        await refreshSeatsData();
      }

      setReservationId(null);
    },
    [refreshSeatsData]
  );
  if (!selectedScreening || !movie) {
    return (
      <div className='flex items-center justify-center w-full h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <main className='w-full px-4 py-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col md:flex-row gap-8 mb-8'>
          <div className='w-full md:w-1/2 space-y-2'>
            <BookingDetails movie={movie} screening={selectedScreening} />

            <ScreeningSelector
              screenings={screenings}
              selectedScreening={selectedScreening}
              onScreeningSelect={setSelectedScreening}
              maxDays={5} // Show only 5 days (like original BookingScreeningSelector)
              showActions={false} // Hide action buttons (we have our own)
              customClass='mt-4' // Add a custom class if needed
            />
          </div>

          <div className='w-full md:w-1/2 flex justify-end'>
            <div className='w-full max-w-md ml-auto'>
              <TicketSelector
                onTotalTicketsChange={setTotalTickets}
                onFinalPriceChange={handleFinalPriceChange}
                onTicketSummaryChange={setTicketSummary}
              />
            </div>
          </div>
        </div>

        <div className='w-full flex justify-center'>
          <CinemaSeating
            totalTickets={totalTickets}
            screeningId={selectedScreening._id}
            onSelectedSeatsChange={handleSelectedSeatsChange}
            refreshTrigger={refreshSeats}
          />
        </div>
      </div>
      <div className='flex flex-col items-center justify-center gap-4 mt-8'>
        <Button
          variant='primary'
          type='button'
          onClick={handleBooking}
          disabled={totalTickets === 0 || selectedSeats.length !== totalTickets || isBooking || isRefreshing}>
          {isBooking ? 'Booking...' : isRefreshing ? 'Refreshing...' : 'Book'}
        </Button>

        <Link href={`/movies/${movie.slug}`}>
          <Button variant='secondary' type='button'>
            Back
          </Button>
        </Link>
      </div>
      {selectedScreening && (
        <BookingConfirmationModal
          key={reservationId || 'no-reservation'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          reservationId={reservationId}
          movieTitle={movie.title}
          screeningTime={selectedScreening.screeningTime}
          seats={formatSeatLabels(selectedSeats)}
          totalPrice={finalPrice}
          ticketSummary={ticketSummary}
        />
      )}
    </main>
  );
}
