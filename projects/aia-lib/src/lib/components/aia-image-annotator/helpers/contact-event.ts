import { Point } from './point.interface';
import { ContactEventType } from './contact-event-type';

export class ContactEvent {
    public type: ContactEventType;
    public point: Point;

    constructor (type: ContactEventType, point: Point) {
        this.type = type;
        this.point = point;
    }
}
