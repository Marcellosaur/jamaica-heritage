import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Swamp Safari – Falmouth Trelawny';
  currentYear: number = new Date().getFullYear();
}
