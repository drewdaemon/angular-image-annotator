# Angular Image Annotator

## Description
An Angular library for in-browser image annotation (think MSPaint on the canvas).

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
  providers: [],
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

#### `image`
The image to annotate. Can be data URI or a URL.

*NOTE:* Changing this property results in all annotations from the previous image being cleared.

#### `color`
Hex color string.
Default: `#1218CE` (deep blue)

#### `fontFamily`
The font family.
Default: `Georgia`

#### `fontSize`
The font size (including units).
Default: `15px`

### Functions

#### `setTool(toolName: 'pencil'|'text')`
Changes the current tool. Supported tools are pencil and text.

#### `undo()`
Undoes the last action if available.

#### `redo()`
Redoes the last undone action if available.

#### `clear()`
Clears all annotations (undoably).

## Notes
- This library currently only supports a mobile context (touch events).

## Development

### Roadmap
- Function to generate final image
- Ability to set max dimensions
- Support mouse events (desktop context)

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
