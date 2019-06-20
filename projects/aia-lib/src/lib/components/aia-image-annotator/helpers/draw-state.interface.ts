import { AiaImageAnnotatorComponent } from '../aia-image-annotator.component';
import { FloatingTextEntryComponent } from '../floating-text-entry/floating-text-entry.component';

import { Point } from './point.interface';
import { ContactEvent } from './contact-event';
import { PositionTextPair } from './position-text-pair.interface';

export type StateName = 'pencil'|'text';

export abstract class DrawState {

    abstract getName(): StateName;

    abstract contactStart(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void;

    abstract contactMove(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void;

    abstract contactEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void;

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
    private drawNextPoint(ctx: CanvasRenderingContext2D, point: Point) {
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

    public cleanUp(imageAnnotator: AiaImageAnnotatorComponent): void {}
}

export class TextState extends DrawState {
    private currentCommand: TextCommand;
    private currentPosition: Point;

    public getName(): StateName {
        return 'text';
    }

    private generatePositionTextPairs(textEntry: FloatingTextEntryComponent, projectionFactor: number): PositionTextPair[] {
        const fullText = textEntry.getText();
        const lines = fullText.split('\n');
        const lineHeight = textEntry.getLineHeight() * projectionFactor;
        const positionTextPairs: PositionTextPair[] = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                continue;
            }
            const position = {x: this.currentPosition.x, y: this.currentPosition.y + (i * lineHeight)};
            positionTextPairs.push({
                text: lines[i],
                position: position
            });
        }

        return positionTextPairs;
    }

    private recordCommandAndReset(imageAnnotator: AiaImageAnnotatorComponent) {
        const positionTextPairs = this.generatePositionTextPairs(imageAnnotator.textEntry, imageAnnotator.projectionFactor);
        this.currentCommand.addPositionTextPairs(positionTextPairs);
        this.currentCommand.setColor(<string>imageAnnotator.drawingCtx.fillStyle);
        this.currentCommand.setFont(imageAnnotator.drawingCtx.font);
        this.currentCommand.draw(imageAnnotator.drawingCtx);
        imageAnnotator.addCommand(this.currentCommand);
        imageAnnotator.textEntry.clear();
        this.currentCommand = null;
    }

    public contactStart(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        if (this.currentCommand && !imageAnnotator.textEntry.isEmpty()) {
            this.recordCommandAndReset(imageAnnotator);
            imageAnnotator.textEntry.hide();
        } else {
            this.currentCommand = new TextCommand();
            this.currentPosition = ev.point;
            imageAnnotator.textEntry.setPosition(ev.point.x / imageAnnotator.projectionFactor,
                ev.point.y / imageAnnotator.projectionFactor);
            imageAnnotator.textEntry.show();
            imageAnnotator.textEntry.focus();
            imageAnnotator.textEntry.onBlur()
                .then(_ => {
                    if (this.currentCommand && !imageAnnotator.textEntry.isEmpty()) {
                        this.recordCommandAndReset(imageAnnotator);
                    }
                });
        }
    }

    public contactMove(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        this.currentPosition = ev.point;
        imageAnnotator.textEntry.setPosition(ev.point.x / imageAnnotator.projectionFactor,
            ev.point.y / imageAnnotator.projectionFactor);
    }

    public contactEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: ContactEvent): void {
        if (!this.currentCommand) {
            return;
        }
        imageAnnotator.textEntry.focus();
    }

    public cleanUp(imageAnnotator: AiaImageAnnotatorComponent): void {
        if (this.currentCommand && !imageAnnotator.textEntry.isEmpty()) {
            this.recordCommandAndReset(imageAnnotator);
        }
        imageAnnotator.textEntry.hide();
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
    private positionTextPairs: PositionTextPair[] = [];
    private color: string;
    private font: string;

    public addPositionTextPairs(pairs: PositionTextPair[]) {
        this.positionTextPairs = this.positionTextPairs.concat(pairs);
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
        for (const pair of this.positionTextPairs) {
            ctx.fillText(pair.text, pair.position.x, pair.position.y);
        }
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
