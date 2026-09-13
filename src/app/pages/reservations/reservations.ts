import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation';
import { AuditService } from '../../services/audit';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations implements OnInit {
  reservationService = inject(ReservationService);
  private auditService = inject(AuditService);
  private router = inject(Router);

  reservations = this.reservationService.list();

  ngOnInit(): void {
    this.reservationService.syncFromApi().then((ok) => {
      if (ok) this.reservations = this.reservationService.list();
    });
  }

  formatCLP(amount: number): string {
    return '$' + amount.toLocaleString('es-CL') + ' CLP';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CL', { dateStyle: 'medium' });
  }

  remove(id: string): void {
    const item = this.reservations.find((r) => r.id === id);
    this.reservationService.remove(id);
    this.reservations = this.reservationService.list();
    if (item) {
      this.auditService.log('reserva', `Reserva ${item.folio} eliminada · ${item.title}`, item.guestName);
    }
  }
}