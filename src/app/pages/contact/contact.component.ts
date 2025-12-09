import { Component } from '@angular/core';

interface ContactForm {
  name: string;
  email: string;
  groupSize: number | null;
  message: string;
  tourType: string;
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
    groupSize: null,
    message: '',
    tourType: 'General Tour'
  };

  onSubmit() {
    // For this assignment, we simply flag as submitted.
    this.submitted = true;
  }
}
