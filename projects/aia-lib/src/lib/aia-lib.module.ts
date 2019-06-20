import { NgModule } from '@angular/core';
import { AiaImageAnnotatorComponent } from './components/aia-image-annotator/aia-image-annotator.component';
import { FloatingTextEntryComponent } from './components/aia-image-annotator/floating-text-entry/floating-text-entry.component';

@NgModule({
  declarations: [AiaImageAnnotatorComponent, FloatingTextEntryComponent],
  imports: [
  ],
  exports: [AiaImageAnnotatorComponent]
})
export class AngularImageAnnotatorModule { }
