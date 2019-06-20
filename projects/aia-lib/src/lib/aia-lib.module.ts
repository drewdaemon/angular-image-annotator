import { NgModule } from '@angular/core';
import { AiaImageAnnotatorComponent } from './components/aia-image-annotator/aia-image-annotator.component';
import { FloatingTextEntryComponent } from './components/aia-image-annotator/floating-text-entry/floating-text-entry.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AiaImageAnnotatorComponent, FloatingTextEntryComponent],
  imports: [
    FormsModule
  ],
  exports: [AiaImageAnnotatorComponent]
})
export class AngularImageAnnotatorModule { }
