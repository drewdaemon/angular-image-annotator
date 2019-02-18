import { Component, ViewChild } from '@angular/core';
import { BASE64_IMAGE } from './base64Image';
import { AiaImageAnnotatorComponent } from 'aia-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  base64Image = BASE64_IMAGE;
  @ViewChild('annotator') annotator: AiaImageAnnotatorComponent;

  public pencilTool() {
    this.annotator.setTool('pencil');
  }

  public textTool() {
    this.annotator.setTool('text');
  }
}
