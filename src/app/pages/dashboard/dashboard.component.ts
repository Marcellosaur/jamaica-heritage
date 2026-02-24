import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardOrder, ShopService, TourBooking, UserProfile } from '../../services/shop.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bookings: TourBooking[] = [];
  orders: DashboardOrder[] = [];

  profile: UserProfile = {
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    parish_state: '',
    postal_code: '',
    country: ''
  };

  tourType = 'General Tour';
  groupSize: number | null = null;
  preferredDate = '';
  notes = '';

  loading = true;
  bookingSubmitting = false;
  bookingError = '';
  bookingSuccess = '';

  profileSaving = false;
  profileError = '';
  profileSuccess = '';

  dataError = '';

  constructor(private readonly shopService: ShopService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  submitTourBooking(): void {
    this.bookingError = '';
    this.bookingSuccess = '';

    if (!this.tourType.trim()) {
      this.bookingError = 'Tour type is required.';
      return;
    }

    this.bookingSubmitting = true;

    this.shopService.createTourBooking({
      tourType: this.tourType,
      groupSize: this.groupSize,
      preferredDate: this.preferredDate,
      notes: this.notes
    }).subscribe({
      next: () => {
        this.bookingSuccess = 'Tour booking request submitted successfully.';
        this.groupSize = null;
        this.preferredDate = '';
        this.notes = '';
        this.loadBookings();
      },
      error: (err) => {
        const message = err?.error?.message;
        this.bookingError = typeof message === 'string' ? message : 'Failed to submit tour booking.';
      },
      complete: () => {
        this.bookingSubmitting = false;
      }
    });
  }

  saveProfile(): void {
    this.profileError = '';
    this.profileSuccess = '';

    if (!this.profile.full_name.trim() || !this.profile.address_line1.trim() || !this.profile.city.trim() || !this.profile.country.trim()) {
      this.profileError = 'Full name, address line 1, city, and country are required.';
      return;
    }

    this.profileSaving = true;
    this.shopService.saveMyProfile(this.profile).subscribe({
      next: () => {
        this.profileSuccess = 'Account details saved.';
      },
      error: (err) => {
        const message = err?.error?.message;
        this.profileError = typeof message === 'string' ? message : 'Failed to save account details.';
      },
      complete: () => {
        this.profileSaving = false;
      }
    });
  }

  minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.dataError = '';

    forkJoin({
      orders: this.shopService.getMyOrders(),
      bookings: this.shopService.getMyTourBookings(),
      profile: this.shopService.getMyProfile()
    }).subscribe({
      next: ({ orders, bookings, profile }) => {
        this.orders = orders;
        this.bookings = bookings;
        this.profile = profile;
        this.loading = false;
      },
      error: () => {
        this.dataError = 'Failed to load dashboard details.';
        this.loading = false;
      }
    });
  }

  private loadBookings(): void {
    this.shopService.getMyTourBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
      },
      error: () => {
        this.dataError = 'Failed to load dashboard details.';
      }
    });
  }
}
