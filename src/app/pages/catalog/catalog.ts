import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';

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
  imports: [CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit {
  private http = inject(HttpClient);
  authService = inject(AuthService);

  lodgings: Lodging[] = [];
  loading = true;
  error: string | null = null;

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
}