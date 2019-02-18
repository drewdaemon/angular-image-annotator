import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { DrawState, PencilState, TextState, DrawCommand, StateName, ClearCommand } from './helpers/draw-state.interface';
import { DEFAULTS } from './helpers/defaults';

@Component({
  selector: 'aia-image-annotator',
  templateUrl: './aia-image-annotator.component.html',
  styleUrls: ['./aia-image-annotator.component.scss']
})
export class AiaImageAnnotatorComponent implements OnInit {
  @Input() image: string;
  @Input() font: string;

  @ViewChild('imageCanvas') private imageCanvasRef: ElementRef;
  @ViewChild('drawingCanvas') private drawingCanvasRef: ElementRef;
  @ViewChild('textBox') textBoxRef: ElementRef;

  public imageWidth = 0;
  public imageHeight = 0;
  private _state: DrawState = new PencilState();
  private _drawCommands: DrawCommand[] = [];
  private _redoCommands: DrawCommand[] = [];

  public imageCtx: CanvasRenderingContext2D;
  public drawingCtx: CanvasRenderingContext2D;

  public get canvasRect(): ClientRect {
    return this.drawingCanvasRef.nativeElement.getBoundingClientRect();
  }

  constructor() { }

  ngOnInit() {
    const tempImage = new Image();
    tempImage.onload = _ => {
      this.imageWidth = tempImage.width;
      this.imageHeight = tempImage.height;
      this.initializeCanvas(tempImage);
    };
    tempImage.src = this.image;
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
    switch(toolName) {
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
   * END PUBLIC INTERFACE
   */

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

  private initializeCanvas(img: HTMLImageElement) {
    this.imageCanvasRef.nativeElement.width = img.width;
    this.imageCanvasRef.nativeElement.height = img.height;
    this.imageCtx = this.imageCanvasRef.nativeElement.getContext('2d');
    this.imageCtx.drawImage(img, 0, 0);

    this.drawingCanvasRef.nativeElement.width = img.width;
    this.drawingCanvasRef.nativeElement.height = img.height;

    this.drawingCtx = this.drawingCanvasRef.nativeElement.getContext('2d');
    this.drawingCtx.lineJoin = 'round';
    this.drawingCtx.lineWidth = 2;
    this.drawingCtx.font = this.font || DEFAULTS.font;
    this.drawingCtx.textBaseline = 'hanging';

    this.textBoxRef.nativeElement.style.font = this.font || DEFAULTS.font;
  }

  public addCommand(command: DrawCommand) {
    this._drawCommands.push(command);
    this._redoCommands = [];
  }

  public touchStart(ev: TouchEvent) {
    this._state.touchStart(this, ev);
  }

  public touchMove(ev: TouchEvent) {
    this._state.touchMove(this, ev);
  }

  public touchEnd(ev: TouchEvent) {
    this._state.touchEnd(this, ev);
  }

  public keyUp(ev: KeyboardEvent) {
    this._state.keyUp(this, ev);
  }
}
