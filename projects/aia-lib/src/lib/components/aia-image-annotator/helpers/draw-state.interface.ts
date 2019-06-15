import { ElementRef } from '@angular/core';

import { AiaImageAnnotatorComponent } from '../aia-image-annotator.component';
import { Point } from './point.interface';
import { ContactEvent } from './contact-event';

export type StateName = 'pencil'|'text';

export abstract class DrawState {

    abstract getName(): StateName;

    abstract contactStart(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void;

    abstract contactMove(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void;

    abstract contactEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void;

    abstract keyUp(imageAnnotator: AiaImageAnnotatorComponent, ev: KeyboardEvent): void;

    abstract cleanUp(imageAnnotator: AiaImageAnnotatorComponent): void;
}

export class PencilState extends DrawState {
    currentCommand: PencilCommand = new PencilCommand();
    lastCoord: Point;

    /**
     * Draws the next point in the path
     * @param ctx Canvas to be drawn on
     * @param point Next point to draw
     */
    private drawNextPoint(ctx: CanvasRenderingContext2D, point) {
        ctx.beginPath();
        ctx.moveTo(this.lastCoord.x, this.lastCoord.y);
        ctx.lineTo(point.x, point.y);
        ctx.closePath();
        ctx.stroke();
    }

    public getName(): StateName {
        return 'pencil';
    }

    public contactStart(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        this.lastCoord = ev.point;
        this.currentCommand.setColor(<string>imageAnnotator.drawingCtx.fillStyle);
    }

    public contactMove(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        this.currentCommand.addPoint(ev.point);
        this.drawNextPoint(imageAnnotator.drawingCtx, ev.point);
        this.lastCoord = ev.point;
    }

    public contactEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        this.currentCommand.addPoint(ev.point);
        this.drawNextPoint(imageAnnotator.drawingCtx, ev.point);
        imageAnnotator.addCommand(this.currentCommand);
        this.currentCommand = new PencilCommand();
    }

    public keyUp(imageAnnotator: AiaImageAnnotatorComponent, ev: KeyboardEvent): void {}

    public cleanUp(imageAnnotator: AiaImageAnnotatorComponent): void {}
}

export class TextState extends DrawState {
    currentCommand: TextCommand;

    public getName(): StateName {
        return 'text';
    }

    private positionTextBox(textBoxRef: ElementRef, x: number, y: number) {
        textBoxRef.nativeElement.style.top = y + 'px';
        textBoxRef.nativeElement.style.left = x + 'px';
    }

    private focusTextBox(textBoxRef: ElementRef) {
        setTimeout(_ => {
            textBoxRef.nativeElement.focus();
        }, 0);
    }

    private clearTextBox(textBoxRef: ElementRef) {
        textBoxRef.nativeElement.value = '';
    }

    private onTextBoxBlur(textBoxRef: ElementRef): Promise<any> {
        return new Promise<any>(resolve => {
            textBoxRef.nativeElement.addEventListener('blur', resolve);
        });
    }

    private recordCommandAndReset(imageAnnotator: AiaImageAnnotatorComponent) {
        this.currentCommand.setColor(<string>imageAnnotator.drawingCtx.fillStyle);
        this.currentCommand.setFont(imageAnnotator.drawingCtx.font);
        this.currentCommand.draw(imageAnnotator.drawingCtx);
        imageAnnotator.addCommand(this.currentCommand);
        this.clearTextBox(imageAnnotator.textBoxRef);
        this.currentCommand = null;
    }

    public contactStart(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        if (this.currentCommand && !this.currentCommand.empty()) {
            this.recordCommandAndReset(imageAnnotator);
        } else {
            this.currentCommand = new TextCommand(ev.point);
            this.positionTextBox(imageAnnotator.textBoxRef,
                ev.point.x / imageAnnotator.projectionFactor, ev.point.y / imageAnnotator.projectionFactor);
            this.focusTextBox(imageAnnotator.textBoxRef);
            this.onTextBoxBlur(imageAnnotator.textBoxRef)
                .then(_ => {
                    if (this.currentCommand && !this.currentCommand.empty()) {
                        this.recordCommandAndReset(imageAnnotator);
                    }
                });
        }
    }

    public contactMove(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        this.currentCommand.updatePosition(ev.point);
        this.positionTextBox(imageAnnotator.textBoxRef, ev.point.x, ev.point.y);
    }

    public contactEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        if (!this.currentCommand) {
            return;
        }
        this.focusTextBox(imageAnnotator.textBoxRef);
    }

    public keyUp(_: AiaImageAnnotatorComponent, ev: KeyboardEvent) {
        if (!this.currentCommand) {
            return;
        }
        this.currentCommand.setText((<HTMLInputElement>ev.target).value);
    }

    public cleanUp(imageAnnotator: AiaImageAnnotatorComponent): void {
        if (this.currentCommand && !this.currentCommand.empty()) {
            this.recordCommandAndReset(imageAnnotator);
        }
    }
}

export interface DrawCommand {
    draw(ctx: CanvasRenderingContext2D): void;
}

export class PencilCommand implements DrawCommand {
    private pathArray: Point[] = [];
    private color: string;

    constructor() { }

    public addPoint(point: Point) {
        this.pathArray.push(point);
    }

    public setColor(color: string) {
        this.color = color;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const currentStrokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        for (let i = 1; i < this.pathArray.length; i++) {
            const coord = this.pathArray[i];
            const lastCoord = this.pathArray[i - 1];
            ctx.moveTo(lastCoord.x, lastCoord.y);
            ctx.lineTo(coord.x, coord.y);
            ctx.closePath();
        }
        ctx.stroke();
        ctx.strokeStyle = currentStrokeStyle;
    }
}

export class TextCommand implements DrawCommand {
    private position: Point;
    private text = '';
    private color: string;
    private font: string;

    constructor(point: Point) {
        this.position = point;
    }

    public empty(): boolean {
        return this.text === '';
    }

    public updatePosition(point: Point) {
        this.position = point;
    }

    public setText(text: string) {
        this.text = text;
    }

    public setColor(color: string) {
        this.color = color;
    }

    public setFont(font: string) {
        this.font = font;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const currentFillStyle = ctx.fillStyle;
        const currentFont = ctx.font;
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(this.text, this.position.x, this.position.y);
        ctx.fillStyle = currentFillStyle;
        ctx.font = currentFont;
    }
}


export class ClearCommand implements DrawCommand {
    private canvasWidth;
    private canvasHeight;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
}
