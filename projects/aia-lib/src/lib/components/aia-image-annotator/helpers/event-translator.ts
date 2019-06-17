import { ContactEvent } from './contact-event';
import { ContactEventType } from './contact-event-type';
import { Point } from './point.interface';

export class EventTranslator {
    public translate(event: TouchEvent|MouseEvent, canvasRect: ClientRect, projectionFactor: number) {
        let singleEvent;
        // @ts-ignore
        if (window.TouchEvent && event instanceof TouchEvent) {
            singleEvent = event.changedTouches.item(0);
        } else {
            singleEvent = event;
        }
        const point = this.getCanvasPointFromEvent(singleEvent, canvasRect.left, canvasRect.top, projectionFactor);
        return new ContactEvent(this.getTypeFromEvent(event), point);
    }

    private getCanvasPointFromEvent(ev: MouseEvent, offsetLeft: number, offsetTop: number, projectionFactor: number): Point {
        const point: Point = {
            x: (ev.clientX - offsetLeft) * projectionFactor,
            y: (ev.clientY - offsetTop) * projectionFactor
        };
        return point;
    }

    private getTypeFromEvent(ev: TouchEvent|MouseEvent): ContactEventType {
        let type: ContactEventType;
        switch (ev.type) {
            case 'touchstart':
                type = 'start';
                break;
            case 'mousedown':
                type = 'start';
                break;
            case 'touchmove':
                type = 'move';
                break;
            case 'mousemove':
                type = 'move';
                break;
            case 'touchend':
                type = 'end';
                break;
            case 'mouseup':
                type = 'end';
                break;
            default:
                console.error(`aia-image-annotator: unrecognized contact event: ${ev.type}`);
        }
        return type;
    }
}
