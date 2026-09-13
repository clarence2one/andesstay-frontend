import { Injectable } from '@angular/core';

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

const STORAGE_KEY = 'andesstay_reservations';
const IVA_RATE = 0.19;

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
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
  }
}