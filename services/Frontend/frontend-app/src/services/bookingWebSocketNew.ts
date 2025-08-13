import * as signalR from '@microsoft/signalr';

export interface SeatEvent {
  seatId: number;
  userId: string;
  connectionId: string;
  timestamp: string;
  reason?: string;
}

export interface SeatSelection {
  seatId: number;
  userId: string;
  connectionId: string;
  selectedAt: string;
}

class BookingWebSocketService {
  private connection: signalR.HubConnection | null = null;
  private currentShowtimeId: string | null = null;
  private currentUserId: string = 'user-' + Math.random().toString(36).substr(2, 9);
  private callbacks: {
    onSeatSelected?: (event: SeatEvent) => void;
    onSeatReleased?: (event: SeatEvent) => void;
    onSeatReserved?: (event: SeatEvent) => void;
    onUserJoined?: (connectionId: string) => void;
    onUserLeft?: (connectionId: string) => void;
    onUserDisconnected?: (connectionId: string) => void;
    onSeatAlreadySelected?: (event: { seatId: number; message: string }) => void;
  } = {};

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5005/booking-hub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Configurar event listeners
    this.setupEventListeners();

    try {
      await this.connection.start();
      console.log('🔌 WebSocket conectado al hub de reservas');
    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    this.connection.on('SeatSelected', (event: SeatEvent) => {
      console.log('🪑 Asiento seleccionado:', event);
      this.callbacks.onSeatSelected?.(event);
    });

    this.connection.on('SeatReleased', (event: SeatEvent) => {
      console.log('🪑 Asiento liberado:', event);
      this.callbacks.onSeatReleased?.(event);
    });

    this.connection.on('SeatReserved', (event: SeatEvent) => {
      console.log('🎫 Asiento reservado:', event);
      this.callbacks.onSeatReserved?.(event);
    });

    this.connection.on('UserJoined', (connectionId: string) => {
      console.log('👤 Usuario unido:', connectionId);
      this.callbacks.onUserJoined?.(connectionId);
    });

    this.connection.on('UserLeft', (connectionId: string) => {
      console.log('👤 Usuario salió:', connectionId);
      this.callbacks.onUserLeft?.(connectionId);
    });

    this.connection.on('UserDisconnected', (connectionId: string) => {
      console.log('👤 Usuario desconectado:', connectionId);
      this.callbacks.onUserDisconnected?.(connectionId);
    });

    this.connection.on('SeatAlreadySelected', (event: { seatId: number; message: string }) => {
      console.log('⚠️ Asiento ya seleccionado:', event);
      this.callbacks.onSeatAlreadySelected?.(event);
    });
  }

  async joinShowtime(showtimeId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }

    if (this.currentShowtimeId && this.currentShowtimeId !== showtimeId) {
      await this.leaveShowtime();
    }

    this.currentShowtimeId = showtimeId;
    
    try {
      await this.connection!.invoke('JoinShowtimeGroup', showtimeId);
      console.log(`📺 Unido a la función ${showtimeId}`);
    } catch (error) {
      console.error('❌ Error uniéndose a la función:', error);
    }
  }

  async leaveShowtime(): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) return;

    try {
      await this.connection.invoke('LeaveShowtimeGroup', this.currentShowtimeId);
      console.log(`📺 Salió de la función ${this.currentShowtimeId}`);
      this.currentShowtimeId = null;
    } catch (error) {
      console.error('❌ Error saliendo de la función:', error);
    }
  }

  async selectSeat(seatId: number): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) {
      console.warn('⚠️ No hay conexión o función activa');
      return;
    }

    try {
      await this.connection.invoke('SelectSeat', this.currentShowtimeId, seatId, this.currentUserId);
    } catch (error) {
      console.error('❌ Error seleccionando asiento:', error);
    }
  }

  async releaseSeat(seatId: number): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) {
      console.warn('⚠️ No hay conexión o función activa');
      return;
    }

    try {
      await this.connection.invoke('ReleaseSeat', this.currentShowtimeId, seatId, this.currentUserId);
    } catch (error) {
      console.error('❌ Error liberando asiento:', error);
    }
  }

  async reserveSeat(seatId: number): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) {
      console.warn('⚠️ No hay conexión o función activa');
      return;
    }

    try {
      await this.connection.invoke('ReserveSeat', this.currentShowtimeId, seatId, this.currentUserId);
    } catch (error) {
      console.error('❌ Error reservando asiento:', error);
    }
  }

  async getActiveSelections(): Promise<SeatSelection[]> {
    if (!this.currentShowtimeId) {
      return [];
    }

    try {
      const response = await fetch(`http://localhost:5005/api/SeatRealtime/showtime/${this.currentShowtimeId}/active-selections`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('❌ Error obteniendo selecciones activas:', error);
    }
    return [];
  }

  setCallbacks(callbacks: typeof this.callbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  async disconnect(): Promise<void> {
    if (this.currentShowtimeId) {
      await this.leaveShowtime();
    }

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('🔌 WebSocket desconectado');
    }
  }
}

export const bookingWebSocketService = new BookingWebSocketService();
