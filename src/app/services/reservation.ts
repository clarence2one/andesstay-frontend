import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reservation {
  id: string;
  folio: string;
  lodgingId: number;
  title: string;
  location: string;
  imageUrl: string;
  pricePerNight: number;
  nights: number;
  guestName: string;
  createdAt: string;
  subtotal: number;
  iva: number;
  total: number;
}

interface ApiReservation {
  id?: number;
  folio: string;
  lodgingId?: number;
  title: string;
  guestName?: string;
  nights?: number;
  pricePerNight?: number;
  subtotal?: number;
  iva?: number;
  total?: number;
  createdAt?: string;
}

const STORAGE_KEY = 'andesstay_reservations';
const IVA_RATE = 0.19;

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);

  reserve(data: {
    lodgingId: number;
    title: string;
    location: string;
    imageUrl: string;
    pricePerNight: number;
    nights: number;
    guestName: string;
  }): Reservation {
    const now = new Date();
    const id = makeId();
    const seq = String(this.list().length + 1).padStart(3, '0');
    const folio = `AS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${seq}`;
    const subtotal = Math.round(data.pricePerNight * data.nights);
    const iva = Math.round(subtotal * IVA_RATE);

    const reservation: Reservation = {
      id,
      folio,
      lodgingId: data.lodgingId,
      title: data.title,
      location: data.location,
      imageUrl: data.imageUrl,
      pricePerNight: data.pricePerNight,
      nights: data.nights,
      guestName: data.guestName,
      createdAt: now.toISOString(),
      subtotal,
      iva,
      total: subtotal + iva
    };

    const list = this.list();
    list.push(reservation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    // Espejo al microservicio de reservas (con fallback: si falla, queda en local).
    this.pushToApi(reservation).catch(() => {});

    return reservation;
  }

  list(): Reservation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Reservation[]) : [];
    } catch {
      return [];
    }
  }

  get(id: string): Reservation | undefined {
    return this.list().find((r) => r.id === id);
  }

  remove(id: string): void {
    const remaining = this.list().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    this.deleteFromApi(id).catch(() => {});
  }

  /** Trae las reservas del microservicio (persistidas en BD cloud) y refresca el local. */
  async syncFromApi(): Promise<boolean> {
    try {
      const apiList: ApiReservation[] = await firstValueFrom(
        this.http.get<ApiReservation[]>(`${environment.apiBaseUrl}/reservations`)
      );
      const mapped: Reservation[] = apiList.map((r) => ({
        id: String(r.id),
        folio: r.folio,
        lodgingId: r.lodgingId ?? 0,
        title: r.title,
        location: '',
        imageUrl: '',
        pricePerNight: r.pricePerNight ?? 0,
        nights: r.nights ?? 0,
        guestName: r.guestName ?? '',
        createdAt: r.createdAt ?? new Date().toISOString(),
        subtotal: r.subtotal ?? 0,
        iva: r.iva ?? 0,
        total: r.total ?? 0
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      return true;
    } catch {
      return false;
    }
  }

  private pushToApi(r: Reservation): Promise<void> {
    const body: ApiReservation = {
      folio: r.folio,
      lodgingId: r.lodgingId,
      title: r.title,
      guestName: r.guestName,
      nights: r.nights,
      pricePerNight: r.pricePerNight,
      subtotal: r.subtotal,
      iva: r.iva,
      total: r.total
    };
    return firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/reservations`, body)
    ).then(() => {});
  }

  private deleteFromApi(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete(`${environment.apiBaseUrl}/reservations/${id}`)
    ).then(() => {});
  }
}