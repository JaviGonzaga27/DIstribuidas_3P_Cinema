import { useEffect, useRef, useState } from 'react';
import { bookingWebSocketService, SeatEvent } from '@/services/bookingWebSocket';

interface UseSeatWebSocketProps {
  showtimeId: string;
  onSeatSelected?: (event: SeatEvent) => void;
  onSeatReleased?: (event: SeatEvent) => void;
  onSeatReserved?: (event: SeatEvent) => void;
  onSeatAlreadySelected?: (event: { seatId: number; message: string }) => void;
}

interface SeatState {
  [seatId: number]: {
    isSelectedByOther: boolean;
    selectedByUserId?: string;
    connectionId?: string;
  };
}

export function useSeatWebSocket({ 
  showtimeId, 
  onSeatSelected, 
  onSeatReleased, 
  onSeatReserved,
  onSeatAlreadySelected 
}: UseSeatWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [otherUserSelections, setOtherUserSelections] = useState<SeatState>({});
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const currentUserRef = useRef(bookingWebSocketService.getCurrentUserId());
  
  // Usar refs para los callbacks para evitar dependencias en useEffect
  const callbacksRef = useRef({
    onSeatSelected,
    onSeatReleased,
    onSeatReserved,
    onSeatAlreadySelected
  });
  
  // Actualizar los callbacks en el ref cuando cambien
  useEffect(() => {
    callbacksRef.current = {
      onSeatSelected,
      onSeatReleased,
      onSeatReserved,
      onSeatAlreadySelected
    };
  }, [onSeatSelected, onSeatReleased, onSeatReserved, onSeatAlreadySelected]);

  useEffect(() => {
    let mounted = true;

    const connectAndJoin = async () => {
      try {
        setConnectionError(null);
        
        // Configurar callbacks usando los refs
        bookingWebSocketService.setCallbacks({
          onSeatSelected: (event: SeatEvent) => {
            if (mounted) {
              // Si no es el usuario actual, marcar como seleccionado por otro
              if (event.userId !== currentUserRef.current) {
                setOtherUserSelections(prev => ({
                  ...prev,
                  [event.seatId]: {
                    isSelectedByOther: true,
                    selectedByUserId: event.userId,
                    connectionId: event.connectionId
                  }
                }));
              }
              callbacksRef.current.onSeatSelected?.(event);
            }
          },
          
          onSeatReleased: (event: SeatEvent) => {
            if (mounted) {
              // Remover de selecciones de otros usuarios
              setOtherUserSelections(prev => {
                const newState = { ...prev };
                delete newState[event.seatId];
                return newState;
              });
              callbacksRef.current.onSeatReleased?.(event);
            }
          },
          
          onSeatReserved: (event: SeatEvent) => {
            if (mounted) {
              // Remover de selecciones temporales
              setOtherUserSelections(prev => {
                const newState = { ...prev };
                delete newState[event.seatId];
                return newState;
              });
              callbacksRef.current.onSeatReserved?.(event);
            }
          },
          
          onUserJoined: (connectionId: string) => {
            if (mounted) {
              setActiveUsers(prev => new Set([...prev, connectionId]));
            }
          },
          
          onUserLeft: (connectionId: string) => {
            if (mounted) {
              setActiveUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(connectionId);
                return newSet;
              });
            }
          },
          
          onUserDisconnected: (connectionId: string) => {
            if (mounted) {
              // Limpiar selecciones de este usuario
              setOtherUserSelections(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(seatId => {
                  if (newState[parseInt(seatId)].connectionId === connectionId) {
                    delete newState[parseInt(seatId)];
                  }
                });
                return newState;
              });
              
              setActiveUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(connectionId);
                return newSet;
              });
            }
          },
          
          onSeatAlreadySelected: (event: { seatId: number; message: string }) => {
            if (mounted) {
              callbacksRef.current.onSeatAlreadySelected?.(event);
            }
          }
        });

        // Conectar y unirse a la función
        await bookingWebSocketService.connect();
        
        // Dar un pequeño delay para asegurar que la conexión esté completamente establecida
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await bookingWebSocketService.joinShowtime(showtimeId);
        
        // Cargar selecciones activas
        const activeSelections = await bookingWebSocketService.getActiveSelections();
        const selectionsState: SeatState = {};
        activeSelections.forEach(selection => {
          if (selection.userId !== currentUserRef.current) {
            selectionsState[selection.seatId] = {
              isSelectedByOther: true,
              selectedByUserId: selection.userId,
              connectionId: selection.connectionId
            };
          }
        });
        
        if (mounted) {
          setOtherUserSelections(selectionsState);
          setIsConnected(true);
        }
        
      } catch (error) {
        console.error('Error conectando WebSocket:', error);
        if (mounted) {
          setConnectionError(error instanceof Error ? error.message : 'Error de conexión');
          setIsConnected(false);
        }
      }
    };

    connectAndJoin();

    return () => {
      mounted = false;
      bookingWebSocketService.leaveShowtime().catch(console.error);
    };
  }, [showtimeId]); // Solo depender de showtimeId

  const selectSeat = async (seatId: number) => {
    try {
      await bookingWebSocketService.selectSeat(seatId);
    } catch (error) {
      console.error('Error seleccionando asiento:', error);
    }
  };

  const releaseSeat = async (seatId: number) => {
    try {
      await bookingWebSocketService.releaseSeat(seatId);
    } catch (error) {
      console.error('Error liberando asiento:', error);
    }
  };

  const reserveSeat = async (seatId: number) => {
    try {
      await bookingWebSocketService.reserveSeat(seatId);
    } catch (error) {
      console.error('Error reservando asiento:', error);
    }
  };

  const isSeatSelectedByOther = (seatId: number): boolean => {
    return otherUserSelections[seatId]?.isSelectedByOther || false;
  };

  const getSeatSelectionInfo = (seatId: number) => {
    return otherUserSelections[seatId] || null;
  };

  return {
    isConnected,
    connectionError,
    activeUsers: activeUsers.size,
    selectSeat,
    releaseSeat,
    reserveSeat,
    isSeatSelectedByOther,
    getSeatSelectionInfo,
    otherUserSelections
  };
}
