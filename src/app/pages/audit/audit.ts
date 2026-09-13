import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class Audit {
  auditService = inject(AuditService);
  events = this.auditService.list();

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'medium' });
  }

  typeLabel(type: string): string {
    switch (type) {
      case 'login': return 'Login';
      case 'logout': return 'Logout';
      case 'reserva': return 'Reserva';
      default: return 'Evento';
    }
  }

  clear(): void {
    this.auditService.clear();
    this.events = this.auditService.list();
  }
}