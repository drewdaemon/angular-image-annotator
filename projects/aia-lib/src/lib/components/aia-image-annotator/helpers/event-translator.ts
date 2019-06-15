import { ContactEvent } from './contact-event';
import { Point } from './point.interface';

export class EventTranslator {
    public translate(event: TouchEvent|MouseEvent, canvasRect: ClientRect, projectionFactor: number) {
        const type = this.getTypeFromEvent(event);

        let singleEvent;
        if (event instanceof TouchEvent) {
            singleEvent = event.changedTouches.item(0);
        } else {
            singleEvent = event;
        }
        const point = this.getCanvasPointFromEvent(singleEvent, canvasRect.left, canvasRect.top, projectionFactor);
        return new ContactEvent('start', point);
    }

    private getCanvasPointFromEvent(ev: MouseEvent, offsetLeft: number, offsetTop: number, projectionFactor: number): Point {
        const point: Point = {
            x: (ev.clientX - offsetLeft) * projectionFactor,
            y: (ev.clientY - offsetTop) * projectionFactor
        };
        return point;
    }

    private getTypeFromEvent(ev: TouchEvent|MouseEvent) {
        // TODO
    }
}
