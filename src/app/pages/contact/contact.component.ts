import { Component } from '@angular/core';

type MessageType = 'Tour Booking Inquiry' | 'Complaint' | 'Feedback';

interface ContactForm {
  name: string;
  email: string;
  messageType: MessageType;
  tourType: string;
  groupSize: number | null;
  preferredDate: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  submitted = false;

  model: ContactForm = {
    name: '',
    email: '',
    messageType: 'Tour Booking Inquiry',
    tourType: 'General Tour',
    groupSize: null,
    preferredDate: '',
    subject: '',
    message: ''
  };

  onSubmit(): void {
    this.submitted = true;
  }

  onMessageTypeChange(): void {
    this.submitted = false;

    if (this.model.messageType !== 'Tour Booking Inquiry') {
      this.model.tourType = 'General Tour';
      this.model.groupSize = null;
      this.model.preferredDate = '';
    }
  }

  isTourInquiry(): boolean {
    return this.model.messageType === 'Tour Booking Inquiry';
  }

  minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
