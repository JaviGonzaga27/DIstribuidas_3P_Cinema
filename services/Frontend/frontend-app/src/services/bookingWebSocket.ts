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
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Si hay una conexión anterior, limpiarla
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn('Error deteniendo conexión anterior:', error);
      }
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5005/booking-hub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: false,
        timeout: 30000, // 30 segundos de timeout
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Intentos de reconexión
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Configurar event listeners
    this.setupEventListeners();

    // Agregar eventos de conexión para debugging
    this.connection.onclose((error) => {
      console.log('🔌 WebSocket desconectado:', error);
    });

    this.connection.onreconnecting((error) => {
      console.log('🔄 WebSocket reconectando...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ WebSocket reconectado:', connectionId);
    });

    try {
      await this.connection.start();
      console.log('🔌 WebSocket conectado al hub de reservas');
      
      // Verificar que realmente esté conectado
      if (this.connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error('La conexión no se estableció correctamente');
      }
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
    // Asegurar que estemos conectados
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }

    // Esperar a que la conexión esté realmente lista
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Connected) {
      // Intentar reconectar si no está conectado
      try {
        await this.connection.start();
      } catch (error) {
        console.error('❌ Error reconectando WebSocket:', error);
        throw error;
      }
    }

    if (this.currentShowtimeId && this.currentShowtimeId !== showtimeId) {
      await this.leaveShowtime();
    }

    this.currentShowtimeId = showtimeId;
    
    try {
      // Verificar una vez más que estamos conectados antes de invocar
      if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('JoinShowtimeGroup', showtimeId);
        console.log(`📺 Unido a la función ${showtimeId}`);
      } else {
        console.warn('⚠️ No se pudo unir a la función: conexión no disponible');
      }
    } catch (error) {
      console.error('❌ Error uniéndose a la función:', error);
    }
  }

  async leaveShowtime(): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) return;

    try {
      // Verificar que la conexión esté activa antes de invocar
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('LeaveShowtimeGroup', this.currentShowtimeId);
        console.log(`📺 Salió de la función ${this.currentShowtimeId}`);
      } else {
        console.warn('⚠️ No se pudo salir de la función: conexión no disponible');
      }
      this.currentShowtimeId = null;
    } catch (error) {
      console.error('❌ Error saliendo de la función:', error);
      this.currentShowtimeId = null; // Limpiar incluso si hay error
    }
  }

  async selectSeat(seatId: number): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) {
      console.warn('⚠️ No hay conexión o función activa');
      return;
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('⚠️ WebSocket no está conectado, reintentando...');
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ Error reconectando para seleccionar asiento:', error);
        return;
      }
    }

    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('SelectSeat', this.currentShowtimeId, seatId, this.currentUserId);
      } else {
        console.warn('⚠️ No se pudo seleccionar asiento: conexión no disponible');
      }
    } catch (error) {
      console.error('❌ Error seleccionando asiento:', error);
    }
  }

  async releaseSeat(seatId: number): Promise<void> {
    if (!this.connection || !this.currentShowtimeId) {
      console.warn('⚠️ No hay conexión o función activa');
      return;
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('⚠️ WebSocket no está conectado, reintentando...');
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ Error reconectando para liberar asiento:', error);
        return;
      }
    }

    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('ReleaseSeat', this.currentShowtimeId, seatId, this.currentUserId);
      } else {
        console.warn('⚠️ No se pudo liberar asiento: conexión no disponible');
      }
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
