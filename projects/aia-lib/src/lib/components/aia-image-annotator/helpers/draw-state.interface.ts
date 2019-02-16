import { AiaImageAnnotatorComponent } from '../aia-image-annotator.component';

export interface DrawState {
    touchStart(imageAnnotator: AiaImageAnnotatorComponent, ev: TouchEvent): void;

    touchMove(imageAnnotator: AiaImageAnnotatorComponent, ev: TouchEvent): void;

    touchEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: TouchEvent): void;
}

export class PencilState implements DrawState {
    currentCommand: PencilCommand = new PencilCommand([]);

    private addPointToCurrentCommand(ev: TouchEvent, offsetLeft: number, offsetTop: number) {
        const touch = ev.changedTouches.item(0);
        this.currentCommand.addPoint(
            {
                x: touch.clientX - offsetLeft,
                y: touch.clientY - offsetTop
            }
        );
    }

    public touchStart(imageAnnotator: AiaImageAnnotatorComponent, ev: TouchEvent): void {
        this.addPointToCurrentCommand(ev, imageAnnotator.canvasRect.left, imageAnnotator.canvasRect.top);
        this.currentCommand.draw(imageAnnotator.drawingCtx);
    }

    public touchMove(imageAnnotator: AiaImageAnnotatorComponent, ev: TouchEvent): void {
        this.addPointToCurrentCommand(ev, imageAnnotator.canvasRect.left, imageAnnotator.canvasRect.top);
        this.currentCommand.draw(imageAnnotator.drawingCtx);
    }

    public touchEnd(imageAnnotator: AiaImageAnnotatorComponent, ev: TouchEvent): void {
        this.addPointToCurrentCommand(ev, imageAnnotator.canvasRect.left, imageAnnotator.canvasRect.top);
        this.currentCommand.draw(imageAnnotator.drawingCtx);
        imageAnnotator.addCommand(this.currentCommand);
        this.currentCommand = new PencilCommand([]);
    }
}

export interface DrawCommand {
    draw(ctx: CanvasRenderingContext2D): void;
}

interface Point {
    x: number;
    y: number;
}

export class PencilCommand implements DrawCommand {
    pathArray: Point[];

    constructor(array: any[]) {
        this.pathArray = array;
    }

    public addPoint(point: Point) {
        this.pathArray.push(point);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        for (let i = 1; i < this.pathArray.length; i++) {
            const coord = this.pathArray[i];
            const lastCoord = this.pathArray[i - 1];
            ctx.moveTo(lastCoord.x, lastCoord.y);
            ctx.lineTo(coord.x, coord.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
}
