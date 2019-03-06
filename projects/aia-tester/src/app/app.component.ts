import { Component, ViewChild } from '@angular/core';
import { HAND_IMAGE } from './images/hand';
import { FLOWER_IMAGE } from './images/flower';
import { AiaImageAnnotatorComponent } from 'angular-image-annotator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  base64Image = FLOWER_IMAGE;
  public strokeColor = '#000';
  public fontSize = '20px';
  public fontFamily = 'Georgia';

  @ViewChild('annotator') annotator: AiaImageAnnotatorComponent;

  public getAnnotatedImage() {
    const annotatedImageURI = this.annotator.getAnnotatedImage();
    const downloadURL = annotatedImageURI.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
    window.open(downloadURL);

  }

  public changeImage(image) {
    if (image === 'flower') {
      this.base64Image = FLOWER_IMAGE;
    } else {
      this.base64Image = HAND_IMAGE;
    }
  }

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
