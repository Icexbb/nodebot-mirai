import {BaseEvent} from "./base.js";

export class BotEvent extends BaseEvent{
    qq:number
    constructor(event:object) {
        super(event);
        this.qq = event['qq']
    }
}

class Friend{
    id: number
    nickname: string
    remark: string
}
export class FriendEvent extends BaseEvent{

    friend:Friend

    constructor(event:object) {
        super(event);
        this.friend = event['friend']
    }

}