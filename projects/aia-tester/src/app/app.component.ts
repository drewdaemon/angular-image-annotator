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
  public strokeColor = '#000';
  public fontSize = '20px';
  public fontFamily = 'Georgia';

  @ViewChild('annotator') annotator: AiaImageAnnotatorComponent;

  public pencilTool() {
    this.annotator.setTool('pencil');
  }

  public textTool() {
    this.annotator.setTool('text');
  }

  public undo() {
    this.annotator.undo();
  }

  public redo() {
    this.annotator.redo();
  }

  public clear() {
    this.annotator.clear();
  }
}
