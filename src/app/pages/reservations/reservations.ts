import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations {
  reservationService = inject(ReservationService);
  private router = inject(Router);

  reservations = this.reservationService.list();

  formatCLP(amount: number): string {
    return '$' + amount.toLocaleString('es-CL') + ' CLP';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CL', { dateStyle: 'medium' });
  }

  remove(id: string): void {
    this.reservationService.remove(id);
    this.reservations = this.reservationService.list();
  }
}