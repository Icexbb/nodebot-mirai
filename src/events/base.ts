export class BaseEvent{
    type:string
    constructor(event:object) {
        this.type=event['type']
    }
}
