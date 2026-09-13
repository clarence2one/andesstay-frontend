import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { ReservationService } from '../../services/reservation';

interface Lodging {
  id: number;
  title: string;
  location: string;
  imageUrl: string;
  pricePerNight?: number;
  price_per_night?: number;
  price?: number;
  cost?: number;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit {
  private http = inject(HttpClient);
  authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  lodgings: Lodging[] = [];
  loading = true;
  error: string | null = null;

  showModal = false;
  selectedItem: Lodging | null = null;
  nights = 2;
  guestName = '';

  ngOnInit(): void {
    this.http.get<Lodging[]>(`${environment.apiBaseUrl}/lodgings`).subscribe({
      next: (data) => {
        this.lodgings = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error catálogo:', err);
        this.error = `Error al conectar con el servidor de alojamientos (${err.status})`;
        this.loading = false;
      }
    });
  }

  getPrice(item: Lodging): number {
    const val = item.pricePerNight ?? item.price_per_night ?? item.price ?? item.cost;
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal > 0) {
      return numVal < 1000 ? numVal * 950 : numVal;
    }
    return 45000 + item.id * 15000;
  }

  formatCLP(amount: number): string {
    return '$' + amount.toLocaleString('es-CL') + ' CLP';
  }

  displayUrl(): string {
    return `${environment.apiBaseUrl}/lodgings`;
  }

  openReserve(item: Lodging): void {
    this.selectedItem = item;
    this.nights = 2;
    this.guestName = this.authService.getUserName() || 'Invitado';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedItem = null;
  }

  confirmReserve(): void {
    if (!this.selectedItem) return;
    const nights = Math.max(1, Math.min(30, Math.floor(this.nights || 1)));
    const reservation = this.reservationService.reserve({
      lodgingId: this.selectedItem.id,
      title: this.selectedItem.title,
      location: this.selectedItem.location,
      imageUrl: this.selectedItem.imageUrl,
      pricePerNight: this.getPrice(this.selectedItem),
      nights,
      guestName: this.guestName.trim() || 'Invitado'
    });
    this.closeModal();
    this.router.navigate(['/booking', reservation.id]);
  }
}