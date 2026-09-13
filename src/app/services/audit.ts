import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuditEvent {
  id: string;
  time: string;
  type: string;
  message: string;
  user?: string;
}

const STORAGE_KEY = 'andesstay_audit';
const MAX_ENTRIES = 200;

@Injectable({ providedIn: 'root' })
export class AuditService {
  private listSubject = new BehaviorSubject<AuditEvent[]>(this.load());
  private toastSubject = new BehaviorSubject<AuditEvent | null>(null);

  list$ = this.listSubject.asObservable();
  toast$ = this.toastSubject.asObservable();

  log(type: string, message: string, user?: string): void {
    const event: AuditEvent = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      time: new Date().toISOString(),
      type,
      message,
      user
    };
    const all = [event, ...this.load()].slice(0, MAX_ENTRIES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      /* storage lleno: se ignora */
    }
    this.listSubject.next(all);
    this.toastSubject.next(event);
  }

  list(): AuditEvent[] {
    return this.listSubject.value;
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    this.listSubject.next([]);
  }

  private load(): AuditEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuditEvent[]) : [];
    } catch {
      return [];
    }
  }
}