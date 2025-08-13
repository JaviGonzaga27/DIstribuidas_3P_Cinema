// Lista de reservas

'use client';

import React from 'react';
import { Booking } from '@/types';
import { BookingCard } from './BookingCard';

interface BookingsListProps {
  bookings: Booking[];
  isLoading?: boolean;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-20"></div>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
              <div className="flex gap-4">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded w-32"></div>
              <div className="h-3 bg-gray-300 rounded w-28"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No hay reservas registradas</div>
        <p className="text-gray-400 mt-2">Las reservas aparecerán aquí cuando se realicen</p>
      </div>
    );
  }

  // Group bookings by status
  const groupedBookings = bookings.reduce((groups, booking) => {
    const status = booking.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(booking);
    return groups;
  }, {} as Record<string, Booking[]>);

  const statusOrder = ['confirmed', 'confirmada', 'pending', 'pendiente', 'cancelled', 'cancelada'];

  return (
    <div className="space-y-8">
      {statusOrder
        .filter(status => groupedBookings[status] && groupedBookings[status].length > 0)
        .map(status => (
          <div key={status}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
              {status === 'confirmed' || status === 'confirmada' ? 'Confirmadas' :
               status === 'pending' || status === 'pendiente' ? 'Pendientes' :
               status === 'cancelled' || status === 'cancelada' ? 'Canceladas' : status}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({groupedBookings[status].length})
              </span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groupedBookings[status]
                .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
                .map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};
