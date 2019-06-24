# Angular Image Annotator

## Description
An Angular library for in-browser image annotation (think MSPaint on the canvas). [View demo.](https://drewctate.github.io/angular-image-annotator-demo/)

## Getting Started

### 1. Install with Yarn/NPM
```bash
yarn add angular-image-annotator
```
or
```bash
npm install angular-image-annotator
```

### 2. Import `AngularImageAnnotatorModule` in your module
```typescript
import { AppComponent } from './app.component';

import { AngularImageAnnotatorModule } from 'angular-image-annotator';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AngularImageAnnotatorModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

### 3. Add image annotator component to your HTML
```html
<aia-image-annotator #annotator [image]="myImage" [fontSize]="'36px'" [fontFamily]="'Times'" [color]="'#000000'"></aia-image-annotator>
```


### 4. Import `AiaImageAnnotatorComponent` in your component and reference with `@ViewChild`
```typescript
import { Component, ViewChild } from '@angular/core';
import { AiaImageAnnotatorComponent } from 'angular-image-annotator';

@Component(...)
export class MyComponent {
  myImage; // Instantiate with your image

  @ViewChild('annotator') annotator: AiaImageAnnotatorComponent;
}
```

## Annotator Component Public API
### Bound properties

#### `image: string`
The image to annotate. Can be data URI or a URL.

*NOTE:* Changing this property results in all annotations from the previous image being cleared.

#### `color: string`
Hex color string.
Default: `#1218CE` (deep blue)

#### `fontFamily: string`
The font family.
Default: `Georgia`

#### `fontSize: string`
The font size (including units).
Default: `15px`

### Functions

#### `setTool(toolName: 'pencil'|'text'): void`
Changes the current tool. Supported tools are pencil and text.

#### `undo(): void`
Undoes the last action if available.

#### `redo(): void`
Redoes the last undone action if available.

#### `clear(): void`
Clears all annotations (undoably).

#### `getAnnotatedImage(type: 'image/jpeg'|'image/png'): string`
Returns annotated image as data URI. Default image type is 'image/png'.

## Notes
- This library currently only supports a mobile context (touch events).

## Development

### Roadmap
[x] Function to generate final image


[ ] Ability to set max dimensions


[ ] Support mouse events (desktop context)

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
