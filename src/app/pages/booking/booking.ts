import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {
  route = inject(ActivatedRoute);
  reservationService = inject(ReservationService);

  reservation = this.reservationService.get(this.route.snapshot.paramMap.get('id') || '');

  formatCLP(amount: number): string {
    return '$' + amount.toLocaleString('es-CL') + ' CLP';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });
  }

  print(): void {
    window.print();
  }
}