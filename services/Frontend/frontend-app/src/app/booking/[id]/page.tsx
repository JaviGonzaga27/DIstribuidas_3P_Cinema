'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showtimesService } from '@/features/showtimes/services/showtimesService';
import { moviesService } from '@/features/movies/services/moviesService';
import { bookingsService } from '@/features/bookings/services/bookingsService';
import { roomsService } from '@/features/rooms/services/roomsService';
import { useSeatWebSocket } from '@/hooks/useSeatWebSocket';
import { Movie, Showtime, CreateBookingDto } from '@/types';
import { ArrowLeft, Clock, Calendar, MapPin, User, CreditCard, Check, Wifi, WifiOff, Users } from 'lucide-react';

interface Seat {
  id: number;
  row: string;
  number: number;
  isOccupied: boolean;
  isSelected: boolean;
  isSelectedByOther?: boolean;
  price: number;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const showtimeId = parseInt(params.id as string);
  
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'seats' | 'customer' | 'payment' | 'confirmation'>('seats');
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  
  // WebSocket integration
  const {
    isConnected,
    connectionError,
    activeUsers,
    selectSeat: wsSelectSeat,
    releaseSeat: wsReleaseSeat,
    reserveSeat: wsReserveSeat,
    isSeatSelectedByOther,
    getSeatSelectionInfo
  } = useSeatWebSocket({
    showtimeId: showtimeId.toString(),
    onSeatSelected: (event) => {
      console.log('👥 Otro usuario seleccionó asiento:', event.seatId);
      updateSeatRealtimeState(event.seatId, 'selected-by-other');
    },
    onSeatReleased: (event) => {
      console.log('👥 Otro usuario liberó asiento:', event.seatId);
      updateSeatRealtimeState(event.seatId, 'available');
    },
    onSeatReserved: (event) => {
      console.log('🎫 Asiento reservado:', event.seatId);
      updateSeatRealtimeState(event.seatId, 'occupied');
    },
    onSeatAlreadySelected: (event) => {
      setNotificationMessage(`El asiento ${event.seatId} ya está siendo seleccionado por otro usuario`);
      setTimeout(() => setNotificationMessage(null), 3000);
    }
  });
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Payment info
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  // Función para generar asientos
  const generateSeats = useCallback(async (showtime: Showtime) => {
    try {
      // Obtener los asientos disponibles usando el servicio
      const availableSeatsFromAPI = await roomsService.getShowtimeSeats(showtime.id);
      
      // Obtener todos los asientos de la sala (por ahora usar sala 1)
      const allSeats = await roomsService.getRoomSeats(1);
      
      if (allSeats.length > 0) {
        // Crear un set de asientos disponibles para búsqueda rápida
        const availableSeatsSet = new Set(availableSeatsFromAPI.map((seat: any) => seat.id));
        
        // Mapear todos los asientos con su estado de disponibilidad
        const seatList: Seat[] = allSeats.map((seat: any) => ({
          id: seat.id,
          row: seat.row,
          number: seat.number,
          isOccupied: !availableSeatsSet.has(seat.id),
          isSelected: false,
          price: showtime.price
        }));
        
        setSeats(seatList);
      } else {
        throw new Error('No seats found');
      }
    } catch (error) {
      console.error('Error fetching seats, falling back to simulation:', error);
      
      // Fallback: generar asientos simulados
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const seatsPerRow = 12;
      const totalSeats = rows.length * seatsPerRow;
      const occupiedCount = totalSeats - showtime.availableSeats;
      
      const seatList: Seat[] = [];
      let occupiedSeats = 0;
      let seatId = 16;
      
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
          const isOccupied = occupiedSeats < occupiedCount && Math.random() < 0.3;
          if (isOccupied) occupiedSeats++;
          
          seatList.push({
            id: seatId,
            row: rows[rowIndex],
            number: seatNumber,
            isOccupied,
            isSelected: false,
            price: showtime.price
          });
          
          seatId++;
        }
      }
      
      setSeats(seatList);
    }
  }, []);

  const loadBookingData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Cargar función
      const showtimesData = await showtimesService.getAll();
      const showtimeData = showtimesData.find(st => st.id === showtimeId);
      
      if (!showtimeData) {
        throw new Error('Función no encontrada');
      }
      
      setShowtime(showtimeData);
      
      // Cargar película
      const movieData = await moviesService.getById(showtimeData.movieId);
      setMovie(movieData);
      
      // Generar asientos (ahora obtiene datos de la API)
      await generateSeats(showtimeData);
      
    } catch (error) {
      console.error('Error loading booking data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showtimeId, generateSeats]);

  useEffect(() => {
    if (showtimeId) {
      loadBookingData();
    }
  }, [showtimeId, loadBookingData]);

  // Actualizar lista de asientos seleccionados cuando cambie el estado de seats
  useEffect(() => {
    const newSelectedSeats = seats.filter(seat => seat.isSelected);
    setSelectedSeats(newSelectedSeats);
  }, [seats]);

  // Función para actualizar el estado de asientos en tiempo real
  const updateSeatRealtimeState = (seatId: number, state: 'selected-by-other' | 'available' | 'occupied') => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === seatId) {
          switch (state) {
            case 'selected-by-other':
              return { ...seat, isSelectedByOther: true };
            case 'available':
              return { ...seat, isSelectedByOther: false, isOccupied: false };
            case 'occupied':
              return { ...seat, isSelectedByOther: false, isOccupied: true, isSelected: false };
            default:
              return seat;
          }
        }
        return seat;
      })
    );
  };

  const toggleSeat = async (seatId: number) => {
    if (currentStep !== 'seats') return;
    
    // Verificar si el asiento está siendo seleccionado por otro usuario
    if (isSeatSelectedByOther(seatId)) {
      setNotificationMessage('Este asiento está siendo seleccionado por otro usuario');
      setTimeout(() => setNotificationMessage(null), 3000);
      return;
    }
    
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.isOccupied) return;
    
    try {
      const newSelectedState = !seat.isSelected;
      
      if (seat.isSelected) {
        // Liberar asiento localmente y via WebSocket
        await wsReleaseSeat(seatId);
      } else {
        // Seleccionar asiento localmente y via WebSocket
        await wsSelectSeat(seatId);
      }
      
      // Actualizar estado de asientos
      setSeats(prevSeats => 
        prevSeats.map(s => 
          s.id === seatId ? { ...s, isSelected: newSelectedState } : s
        )
      );
      
    } catch (error) {
      console.error('Error al cambiar estado del asiento:', error);
      setNotificationMessage('Error al seleccionar asiento. Intenta de nuevo.');
      setTimeout(() => setNotificationMessage(null), 3000);
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleNextStep = () => {
    if (currentStep === 'seats' && selectedSeats.length > 0) {
      setCurrentStep('customer');
    } else if (currentStep === 'customer' && isCustomerInfoValid()) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment' && isPaymentInfoValid()) {
      processPayment();
    }
  };

  const isCustomerInfoValid = () => {
    return customerInfo.name && customerInfo.email && customerInfo.phone;
  };

  const isPaymentInfoValid = () => {
    return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.cardName;
  };

  const processPayment = async () => {
    if (!showtime) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Crear la reserva
      const bookingData: CreateBookingDto = {
        userId: 1, // Por ahora usamos un usuario fijo, en una app real sería del login
        showtimeId: showtime.id,
        seatIds: selectedSeats.map(seat => seat.id) // Usar los IDs reales de los asientos
      };
      
      const booking = await bookingsService.create(bookingData);
      setCreatedBooking(booking);
      
      // Notificar via WebSocket que los asientos fueron reservados
      for (const seat of selectedSeats) {
        await wsReserveSeat(seat.id);
      }
      
      // Simular delay de procesamiento
      setTimeout(() => {
        setCurrentStep('confirmation');
        setIsProcessingPayment(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error al procesar la reserva. Por favor intenta de nuevo.');
      setIsProcessingPayment(false);
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-xl font-semibold mb-2">Cargando reserva...</div>
          <div className="text-gray-400">Preparando tu experiencia de cine</div>
        </div>
      </div>
    );
  }

  if (!showtime || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="w-10 h-10 text-red-400" />
          </div>
          <div className="text-white text-2xl font-bold mb-4">Función no encontrada</div>
          <div className="text-gray-400 mb-8">Lo sentimos, no pudimos encontrar la función que buscas.</div>
          <Link
            href="/cartelera"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-8 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Volver a Cartelera
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-6 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-3 text-gray-300 hover:text-red-400 transition-all duration-300 group"
            >
              <div className="p-2 rounded-full bg-gray-800 group-hover:bg-red-600 transition-all duration-300">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Volver a la película</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Reserva tu entrada
              </h1>
              <p className="text-gray-400 text-sm mt-1">Selecciona tus asientos favoritos</p>
            </div>
            <div className="w-48"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-center space-x-8">
              {[
                { key: 'seats', label: 'Asientos', icon: MapPin },
                { key: 'customer', label: 'Datos', icon: User },
                { key: 'payment', label: 'Pago', icon: CreditCard },
                { key: 'confirmation', label: 'Confirmación', icon: Check }
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                      currentStep === step.key ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 scale-110' :
                      ['customer', 'payment', 'confirmation'].indexOf(currentStep) > ['seats', 'customer', 'payment', 'confirmation'].indexOf(step.key) ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' :
                      'bg-gray-700 text-gray-400 border border-gray-600'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`mt-2 text-sm font-medium transition-colors ${
                      currentStep === step.key ? 'text-red-400 font-semibold' : 
                      ['customer', 'payment', 'confirmation'].indexOf(currentStep) > ['seats', 'customer', 'payment', 'confirmation'].indexOf(step.key) ? 'text-green-400' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 transition-colors ${
                      ['customer', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-2xl border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-28 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center">Poster</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {movie.title}
                </h2>
                <div className="flex items-center gap-6 text-gray-300">
                  <span className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-red-400" />
                    <span className="font-medium">{formatDate(showtime.startTime)}</span>
                  </span>
                  <span className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{formatTime(showtime.startTime)}</span>
                  </span>
                  <span className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="font-medium">Sala {showtime.room}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-xl border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 mb-1">${showtime.price}</div>
              <div className="text-gray-300 text-sm">por entrada</div>
            </div>
          </div>
        </div>

        {/* Content based on current step */}
        {currentStep === 'seats' && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            {/* WebSocket Status */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Selecciona tus asientos</h3>
                <p className="text-gray-400">Haz clic en los asientos que deseas reservar</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Connection Status */}
                <div className="flex items-center gap-3 bg-gray-700/50 px-4 py-2 rounded-lg">
                  {isConnected ? (
                    <>
                      <div className="relative">
                        <Wifi className="w-5 h-5 text-green-400" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-green-400 text-sm font-medium">Conectado</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">Desconectado</span>
                    </>
                  )}
                </div>
                
                {/* Active Users */}
                {isConnected && (
                  <div className="flex items-center gap-3 bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">{activeUsers} usuario(s) viendo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Error */}
            {connectionError && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-400 text-sm font-medium">
                    Error de conexión: {connectionError}. Los asientos se actualizarán cuando se restablezca la conexión.
                  </p>
                </div>
              </div>
            )}

            {/* Notification */}
            {notificationMessage && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <p className="text-yellow-400 text-sm font-medium">{notificationMessage}</p>
                </div>
              </div>
            )}
            
            {/* Screen */}
            <div className="text-center mb-12">
              <div className="relative">
                <div className="bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500 h-3 w-80 mx-auto rounded-full mb-3 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-3 w-80 mx-auto rounded-full"></div>
              </div>
              <div className="text-gray-400 text-sm font-medium tracking-wider">P A N T A L L A</div>
              <div className="text-gray-500 text-xs mt-1">Mejor vista desde el centro</div>
            </div>

            {/* Seats Grid */}
            <div className="max-w-5xl mx-auto mb-10">
              <div className="bg-gradient-to-b from-gray-700/30 to-gray-800/30 rounded-2xl p-8 backdrop-blur-sm">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(row => (
                  <div key={row} className="flex items-center justify-center mb-3">
                    <div className="w-10 text-gray-400 text-center font-bold text-lg">{row}</div>
                    <div className="flex gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(seatNumber => {
                        const seat = seats.find(s => s.row === row && s.number === seatNumber);
                        if (!seat) return null;
                        
                        const isSelectedByOtherUser = isSeatSelectedByOther(seat.id);
                        const selectionInfo = getSeatSelectionInfo(seat.id);
                        
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat.id)}
                            disabled={seat.isOccupied || isSelectedByOtherUser}
                            title={
                              seat.isOccupied ? 'Asiento ocupado' :
                              isSelectedByOtherUser ? `Seleccionado por otro usuario` :
                              seat.isSelected ? 'Asiento seleccionado por ti' :
                              'Asiento disponible'
                            }
                            className={`relative w-10 h-10 rounded-t-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                              seat.isOccupied
                                ? 'bg-gradient-to-b from-red-500 to-red-700 text-white cursor-not-allowed shadow-lg'
                                : isSelectedByOtherUser
                                ? 'bg-gradient-to-b from-orange-400 to-orange-600 text-white cursor-not-allowed animate-pulse shadow-lg shadow-orange-500/30'
                                : seat.isSelected
                                ? 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-lg shadow-green-500/40 scale-110 ring-2 ring-green-400/50'
                                : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-200 hover:from-gray-400 hover:to-gray-600 hover:text-white shadow-md hover:shadow-lg'
                            }`}
                          >
                            {seatNumber}
                            {isSelectedByOtherUser && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white animate-pulse"></div>
                            )}
                            {seat.isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-10 text-gray-400 text-center font-bold text-lg">{row}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <h4 className="text-white font-semibold mb-4 text-center">Leyenda de asientos</h4>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-b from-gray-500 to-gray-700 rounded-t-xl shadow-md"></div>
                  <span className="text-gray-300 text-sm font-medium">Disponible</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-t-xl shadow-lg ring-2 ring-green-400/50"></div>
                  <span className="text-gray-300 text-sm font-medium">Tu selección</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-xl shadow-lg relative">
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">Otro usuario</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-b from-red-500 to-red-700 rounded-t-xl shadow-lg"></div>
                  <span className="text-gray-300 text-sm font-medium">Ocupado</span>
                </div>
              </div>
            </div>

            {/* Selected Seats Summary */}
            {selectedSeats.length > 0 && (
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Asientos seleccionados
                  </h4>
                  <span className="text-green-400 font-semibold">{selectedSeats.length} entrada(s)</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {selectedSeats.map(seat => (
                    <span key={seat.id} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                      Fila {seat.row} - Asiento {seat.number}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-green-500/30">
                  <span className="text-gray-300 font-medium">Subtotal:</span>
                  <span className="text-3xl font-bold text-green-400">${getTotalPrice()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'customer' && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Datos del cliente</h3>
              <p className="text-gray-400">Ingresa tu información personal para completar la reserva</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-3 font-medium">Nombre completo *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300"
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-3 font-medium">Correo electrónico *</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-3 font-medium">Teléfono *</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300"
                  placeholder="+1234567890"
                />
              </div>
            </div>
            
            {/* Summary */}
            <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4">Resumen de tu reserva</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Película:</span>
                  <span className="font-medium">{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asientos:</span>
                  <span className="font-medium">{selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cantidad:</span>
                  <span className="font-medium">{selectedSeats.length} entrada(s)</span>
                </div>
                <div className="flex justify-between text-green-400 font-bold text-lg pt-2 border-t border-blue-500/30">
                  <span>Subtotal:</span>
                  <span>${getTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Información de pago</h3>
              <p className="text-gray-400">Ingresa los datos de tu tarjeta para completar la compra</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-gray-300 mb-3 font-medium">Número de tarjeta *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300 text-lg tracking-wider"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-3 font-medium">Fecha de vencimiento *</label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-3 font-medium">CVV *</label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-3 font-medium">Nombre en la tarjeta *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardName}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardName: e.target.value }))}
                    className="w-full p-4 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300"
                    placeholder="Como aparece en la tarjeta"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 sticky top-4">
                  <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Resumen del pedido
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-300">
                      <span>Entradas ({selectedSeats.length})</span>
                      <span className="font-medium">${getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Comisión de servicio</span>
                      <span className="font-medium">$5</span>
                    </div>
                    <div className="border-t border-green-500/30 pt-4">
                      <div className="flex justify-between text-green-400 font-bold text-xl">
                        <span>Total</span>
                        <span>${getTotalPrice() + 5}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>📧 {customerInfo.email}</div>
                        <div>📱 {customerInfo.phone}</div>
                        <div>🎬 {movie.title}</div>
                        <div>📍 Sala {showtime.room}</div>
                        <div>🪑 {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50 text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">¡Reserva confirmada!</h3>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                Tu reserva ha sido procesada exitosamente. Recibirás un correo de confirmación en breve.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-8 mb-8 text-left max-w-2xl mx-auto">
              <h4 className="text-white font-bold text-xl mb-6 text-center">Detalles de tu reserva</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {createdBooking && (
                    <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                      <div className="text-green-400 font-bold text-lg">ID de Reserva</div>
                      <div className="text-white text-2xl font-mono">#{createdBooking.id}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-400 text-sm">Película</div>
                    <div className="text-white font-semibold">{movie.title}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Fecha</div>
                    <div className="text-white font-semibold">{formatDate(showtime.startTime)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Hora</div>
                    <div className="text-white font-semibold">{formatTime(showtime.startTime)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm">Sala</div>
                    <div className="text-white font-semibold">Sala {showtime.room}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Asientos</div>
                    <div className="text-white font-semibold">{selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Total pagado</div>
                    <div className="text-green-400 font-bold text-xl">${getTotalPrice() + 5}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Email de confirmación</div>
                    <div className="text-white font-semibold text-sm">{customerInfo.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link
                href="/cartelera"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-8 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Ver más películas
              </Link>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-8 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                Descargar entrada
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={() => {
                if (currentStep === 'customer') setCurrentStep('seats');
                else if (currentStep === 'payment') setCurrentStep('customer');
              }}
              className="flex items-center gap-2 bg-gray-600/80 hover:bg-gray-700 backdrop-blur-sm text-white py-4 px-8 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={currentStep === 'seats'}
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>
            
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">
                Paso {['seats', 'customer', 'payment', 'confirmation'].indexOf(currentStep) + 1} de 4
              </div>
              <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                  style={{ 
                    width: `${((['seats', 'customer', 'payment', 'confirmation'].indexOf(currentStep) + 1) / 4) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={
                (currentStep === 'seats' && selectedSeats.length === 0) ||
                (currentStep === 'customer' && !isCustomerInfoValid()) ||
                (currentStep === 'payment' && (!isPaymentInfoValid() || isProcessingPayment))
              }
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {currentStep === 'payment' ? 
                (isProcessingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar ${getTotalPrice() + 5}
                  </>
                )) : (
                  <>
                    Siguiente
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
