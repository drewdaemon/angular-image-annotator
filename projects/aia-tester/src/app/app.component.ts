import { Component } from '@angular/core';
import { BASE64_IMAGE } from './base64Image';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  base64Image = BASE64_IMAGE;
}
