// Componente para mostrar una tarjeta de reserva

'use client';

import React from 'react';
import { Booking } from '@/types';
import { Calendar, Clock, MapPin, User, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'confirmada':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
      case 'cancelada':
        return 'text-red-600 bg-red-100';
      case 'pending':
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'confirmada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Reserva #{booking.id}
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(booking.bookingDate)}
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
          {getStatusIcon(booking.status)}
          {booking.status}
        </div>
      </div>

      {/* Movie and Showtime Info */}
      {booking.showtime && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          {booking.showtime.movie && (
            <h4 className="font-medium text-gray-900 mb-1">
              {booking.showtime.movie.title}
            </h4>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(booking.showtime.startTime)}
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(booking.showtime.startTime)}
            </div>
            
            {booking.showtime.room && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {booking.showtime.room}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span>Usuario ID: {booking.userId}</span>
        </div>

        {booking.seats && booking.seats.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              Asientos: {booking.seats.length} 
              {booking.seats.some(s => s.seat) && (
                <span className="ml-1">
                  ({booking.seats.map(s => s.seat?.seatNumber).join(', ')})
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center text-sm font-semibold text-green-600">
          <DollarSign className="w-4 h-4 mr-2" />
          <span>Total: ${booking.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 border-t pt-3">
        Reservado el {formatDate(booking.bookingDate)} a las {formatTime(booking.bookingDate)}
      </div>
    </div>
  );
};
