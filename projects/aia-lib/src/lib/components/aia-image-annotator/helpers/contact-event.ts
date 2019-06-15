import { Point } from './point.interface';

export class ContactEvent {
    public type: 'start'|'move'|'end';
    public point: Point;

    constructor (type: 'start'|'move'|'end', point: Point) {
        this.type = type;
        this.point = point;
    }
}
