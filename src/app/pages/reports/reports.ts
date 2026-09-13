import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation';
import { AuditService } from '../../services/audit';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  reservationService = inject(ReservationService);
  auditService = inject(AuditService);

  reservations = this.reservationService.list();
  audit = this.auditService.list();

  ngOnInit(): void {
    this.reservationService.syncFromApi().then((ok) => {
      if (ok) this.reservations = this.reservationService.list();
    });
  }

  totalReservas(): number {
    return this.reservations.length;
  }

  totalNoches(): number {
    return this.reservations.reduce((acc, r) => acc + r.nights, 0);
  }

  totalIngresos(): number {
    return this.reservations.reduce((acc, r) => acc + r.total, 0);
  }

  promedioNoche(): number {
    const r = this.reservations;
    if (r.length === 0) return 0;
    return Math.round(r.reduce((acc, x) => acc + x.total, 0) / r.length);
  }

  topLodgings(): { title: string; count: number; revenue: number }[] {
    const map = new Map<string, { title: string; count: number; revenue: number }>();
    for (const r of this.reservations) {
      const cur = map.get(r.title) || { title: r.title, count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += r.total;
      map.set(r.title, cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }

  maxCount(): number {
    const top = this.topLodgings();
    return top.length ? top[0].count : 1;
  }

  formatCLP(amount: number): string {
    return '$' + amount.toLocaleString('es-CL') + ' CLP';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CL', { dateStyle: 'medium' });
  }

  loginCount(): number {
    return this.audit.filter((e) => e.type === 'login').length;
  }
}