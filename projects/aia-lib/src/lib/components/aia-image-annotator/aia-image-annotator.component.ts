import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { DrawState, PencilState, TextState, DrawCommand, StateName, ClearCommand } from './helpers/draw-state.interface';
import { EventTranslator } from './helpers/event-translator';
import { DEFAULTS } from './helpers/defaults';
import { FloatingTextEntryComponent } from './floating-text-entry/floating-text-entry.component';

@Component({
  selector: 'aia-image-annotator',
  templateUrl: './aia-image-annotator.component.html',
  styleUrls: ['./aia-image-annotator.component.scss']
})
export class AiaImageAnnotatorComponent implements OnInit, OnChanges {
  /**
   * The image to annotate. Can be data URI or a URL.
   */
  @Input() image: string;

  /**
   * The font family.
   * Default: Georgia
   */
  @Input() fontFamily: string;

  /**
   * The font size (including units).
   * Default: 15px
   */
  @Input() fontSize: string;

  /**
   * Hex color string.
   * Default: #1218CE (deep blue)
   */
  @Input() color: string;

  @Input() displayWidth = null;

  @ViewChild('imageCanvas') private imageCanvasRef: ElementRef;
  @ViewChild('drawingCanvas') private drawingCanvasRef: ElementRef;
  @ViewChild('mergeCanvas') private mergeCanvasRef: ElementRef;
  @ViewChild(FloatingTextEntryComponent) textEntry: FloatingTextEntryComponent;

  public imageWidth = 0;
  public imageHeight = 0;
  public displayHeight = 0;
  /**
   * Multiply this to project from the DOM space to the canvas space
   */
  public projectionFactor = 0;

  private _state: DrawState = new PencilState();
  private _drawCommands: DrawCommand[] = [];
  private _redoCommands: DrawCommand[] = [];

  public imageCtx: CanvasRenderingContext2D;
  public drawingCtx: CanvasRenderingContext2D;

  public get canvasRect(): ClientRect {
    return this.drawingCanvasRef.nativeElement.getBoundingClientRect();
  }

  private eventTranslator = new EventTranslator();
  private mouseCurrentlyDown = false;

  constructor() { }

  ngOnInit() {
    this.loadImageAndInitializeCanvas(this.image);
  }

  ngOnChanges(changes) {
    if (changes.image) {
      // Full reset
      this._drawCommands = [];
      this._redoCommands = [];
      this.loadImageAndInitializeCanvas(this.image);
    } else {
      // Just colors and fonts
      this.setColorAndFont(this.color, this.fontSize, this.fontFamily);
    }
  }

  /**
   * BEGIN PUBLIC INTERFACE
   */

  /**
   * Sets current tool
   * @param toolName Name of the tool
   */
  public setTool(toolName: StateName) {
    if (toolName === this._state.getName()) {
      return;
    }
    this._state.cleanUp(this);
    switch (toolName) {
      case 'pencil':
        this._state = new PencilState();
        break;
      case 'text':
        this._state = new TextState();
        break;
      default:
        console.error(`Angular Image Annotator: Unrecognized tool name ${toolName}`);
        break;
    }
  }

  /**
   * Undo last action
   */
  public undo() {
    if (!this._drawCommands.length) {
      return;
    }
    this._redoCommands.push(this._drawCommands.pop());
    this.clearCanvas();
    this.drawCommandsOnCanvas(this._drawCommands, this.drawingCtx);
  }

  /**
   * Redo last undone action if available
   */
  public redo() {
    if (!this._redoCommands.length) {
      return;
    }
    this._drawCommands.push(this._redoCommands.pop());
    this.clearCanvas();
    this.drawCommandsOnCanvas(this._drawCommands, this.drawingCtx);
  }

  /**
   * Clears canvas undo-ably
   */
  public clear() {
    const clearCommand = new ClearCommand(
      this.drawingCanvasRef.nativeElement.width,
      this.drawingCanvasRef.nativeElement.height
    );
    this.addCommand(clearCommand);
    this.drawCommandsOnCanvas([clearCommand], this.drawingCtx);
  }

  /**
   * Returns annotated image as data URI
   */
  public getAnnotatedImage(type: 'image/jpeg'|'image/png' = 'image/png'): string {
    const mergeCanvas = this.mergeCanvasRef.nativeElement;
    mergeCanvas.style.width = this.drawingCanvasRef.nativeElement.width;
    mergeCanvas.style.height = this.drawingCanvasRef.nativeElement.height;

    const mergeCtx = mergeCanvas.getContext('2d');
    mergeCtx.drawImage(this.imageCanvasRef.nativeElement, 0, 0);
    mergeCtx.drawImage(this.drawingCanvasRef.nativeElement, 0, 0);
    return mergeCanvas.toDataURL(type);
  }

  /**
   * END PUBLIC INTERFACE
   */

  /**
   * Loads an image from an src and initializes the canvases. CLEARS ALL EXISTING ANNOTATIONS
   * @param image The src for the image to be annotated
   */
  private loadImageAndInitializeCanvas(image: string) {
    if (!image) {
      console.log('aia-image-annotator: No image bound... skipping render');
      return;
    }

    const tempImage = new Image();
    tempImage.onload = _ => {
      this.imageWidth = tempImage.width;
      this.imageHeight = tempImage.height;
      this.initializeDisplayDimensions();
      setTimeout(_ => { // Pushing canvas init to next cycle
        this.initializeCanvas(tempImage);
      }, 0);
    };
    tempImage.src = image;
  }

  /**
   * Sets projection factor, display width, and display height.
   * If display width hasn't been provided, it defaults to the image dimensions
   */
  private initializeDisplayDimensions() {
    if (this.displayWidth) {
      this.displayHeight = this.displayWidth * this.imageHeight / this.imageWidth;
      this.projectionFactor = this.imageHeight / this.displayHeight;
    } else {
      this.displayHeight = this.imageHeight;
      this.displayWidth = this.imageWidth;
      this.projectionFactor = 1;
    }
  }

  /**
   * Initializes the canvases (both drawing and image)
   * Sets canvas dimensions, loads contexts, etc.
   * @param img The image to load on the image canvas
   */
  private initializeCanvas(img: HTMLImageElement) {
    this.imageCtx = this.imageCanvasRef.nativeElement.getContext('2d');
    this.imageCtx.drawImage(img, 0, 0);

    this.drawingCtx = this.drawingCanvasRef.nativeElement.getContext('2d');
    this.drawingCtx.lineJoin = 'round';
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineWidth = 2;

    this.drawingCtx.textBaseline = 'hanging';

    this.setColorAndFont(this.color, this.fontSize, this.fontFamily);
  }

  /**
   * Sets the color and the font
   */
  private setColorAndFont(color: string, fontSize: string, fontFamily: string) {
    if (!this.drawingCtx) {
      return;
    }

    this.drawingCtx.strokeStyle = color || DEFAULTS.color;
    this.drawingCtx.fillStyle = color || DEFAULTS.color;
    this.textEntry.setColor(color || DEFAULTS.color);

    const fontString = `${fontSize || DEFAULTS.fontSize} ${fontFamily || DEFAULTS.fontFamily}`;
    this.drawingCtx.font = fontString;

    const fontParts = fontSize.match(/(.*)(px|pt)/);
    const adjustedFontSize = Math.floor(parseInt(fontParts[1], 10) / this.projectionFactor) + fontParts[2];
    this.textEntry.setFont(`${adjustedFontSize || DEFAULTS.fontSize} ${fontFamily || DEFAULTS.fontFamily}`);
  }


  /**
   * Clears drawing canvas - no questions asked
   */
  private clearCanvas() {
    this.drawingCtx.clearRect(0, 0, this.drawingCanvasRef.nativeElement.width, this.drawingCanvasRef.nativeElement.height);
  }

  /**
   * Draws commands on canvas
   * @param commands The draw commands to be drawn
   * @param ctx The canvas 2d context
   */
  private drawCommandsOnCanvas(commands: DrawCommand[], ctx: CanvasRenderingContext2D) {
    commands.forEach(command => {
      command.draw(ctx);
    });
  }

  public addCommand(command: DrawCommand) {
    this._drawCommands.push(command);
    this._redoCommands = [];
  }

  public touchStart(ev: TouchEvent) {
    const contactEvent = this.eventTranslator.translate(ev, this.canvasRect, this.projectionFactor);
    this._state.contactStart(this, contactEvent);
  }

  public touchMove(ev: TouchEvent) {
    ev.preventDefault(); // Disable scrolling
    const contactEvent = this.eventTranslator.translate(ev, this.canvasRect, this.projectionFactor);
    this._state.contactMove(this, contactEvent);
  }

  public touchEnd(ev: TouchEvent) {
    const contactEvent = this.eventTranslator.translate(ev, this.canvasRect, this.projectionFactor);
    this._state.contactEnd(this, contactEvent);
  }

  public mouseDown(ev: MouseEvent) {
    this.mouseCurrentlyDown = true;
    const contactEvent = this.eventTranslator.translate(ev, this.canvasRect, this.projectionFactor);
    this._state.contactStart(this, contactEvent);
  }

  public mouseMove(ev: MouseEvent) {
    if (!this.mouseCurrentlyDown) {
      return;
    }
    const contactEvent = this.eventTranslator.translate(ev, this.canvasRect, this.projectionFactor);
    this._state.contactMove(this, contactEvent);
  }

  public mouseUp(ev: MouseEvent) {
    this.mouseCurrentlyDown = false;
    const contactEvent = this.eventTranslator.translate(ev, this.canvasRect, this.projectionFactor);
    this._state.contactEnd(this, contactEvent);
  }

}
