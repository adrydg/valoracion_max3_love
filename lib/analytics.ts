/**
 * Sistema de Analytics optimizado para móviles
 * Tracking de eventos del wizard de valoración
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 segundos

  constructor() {
    // Solo en el cliente
    if (typeof window !== 'undefined') {
      this.startBatching();
      this.setupBeforeUnload();
    }
  }

  /**
   * Trackear un evento
   */
  track(event: string, properties?: Record<string, any>) {
    const payload: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.queue.push(payload);

    // Si la cola está llena, enviar inmediatamente
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties);
    }
  }

  /**
   * Trackear timing (duración de algo)
   */
  timing(metric: string, value: number, properties?: Record<string, any>) {
    this.track('timing', {
      metric,
      value,
      ...properties,
    });
  }

  /**
   * Iniciar batching automático
   */
  private startBatching() {
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Enviar eventos acumulados
   */
  private flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    this.send(events);
  }

  /**
   * Enviar al backend
   */
  private async send(events: AnalyticsEvent[]) {
    try {
      // Usar sendBeacon si está disponible (más eficiente)
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify(events)
        );

        if (!success) {
          // Fallback a fetch
          this.sendFetch(events);
        }
      } else {
        // Fallback a fetch
        this.sendFetch(events);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Fallback con fetch
   */
  private sendFetch(events: AnalyticsEvent[]) {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events),
      keepalive: true, // Asegurar que se envíe incluso si se cierra la página
    }).catch((error) => {
      console.error('Analytics fetch error:', error);
    });
  }

  /**
   * Enviar eventos antes de cerrar la página
   */
  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      if (this.queue.length > 0) {
        this.flush();
      }
    });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.queue.length > 0) {
        this.flush();
      }
    });
  }

  /**
   * Limpiar recursos
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Enviar eventos pendientes
  }
}

// Singleton
const analytics = new Analytics();

/**
 * Trackear evento del wizard
 */
export function trackWizardEvent(event: string, properties?: Record<string, any>) {
  analytics.track(`wizard_${event}`, properties);
}

/**
 * Trackear tiempo de un paso
 */
export function trackStepTiming(step: number, duration: number) {
  analytics.timing('step_duration', duration, { step });
}

/**
 * Trackear error de validación
 */
export function trackValidationError(step: number, errors: string[]) {
  analytics.track('wizard_validation_error', {
    step,
    errors,
    errorCount: errors.length,
  });
}

/**
 * Trackear completado del wizard
 */
export function trackWizardComplete(data: {
  totalTime: number;
  totalSteps: number;
  hasPhotos: boolean;
}) {
  analytics.track('wizard_completed', data);
}

/**
 * Trackear abandono del wizard
 */
export function trackWizardAbandoned(step: number, totalSteps: number) {
  analytics.track('wizard_abandoned', {
    step,
    totalSteps,
    progress: (step / totalSteps) * 100,
  });
}

export default analytics;
