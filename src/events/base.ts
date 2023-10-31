import { ClientInfo, FriendInfo } from "../class.js"
import { GetMessage } from "../message/message.js"
import { MessageSegment } from "../message/segment.js"

abstract class BaseEvent {
    type: string
    rawData: object
    constructor(event: object) {
        this.type = event['type']
        this.rawData = event
    }

    abstract toLog(): string
}
abstract class CommandEvent extends BaseEvent {
    constructor(event: object) {
        super(event);
    }
}
abstract class GroupEvent extends BaseEvent {
    constructor(event: object) {
        super(event);
    }
}
class UnimplementedEvent extends BaseEvent {
    constructor(event: object) {
        super(event);
    }
    toLog(): string {
        return `Event Type Unimplemented: ${this.type} ${JSON.stringify(this.rawData)}`
    }
}
abstract class BotEvent extends BaseEvent {
    qq: number

    constructor(event: object) {
        super(event);
        this.qq = event['qq']
    }
}

abstract class ClientEvent extends BaseEvent {
    client: ClientInfo
    constructor(event: object) {
        super(event);
        this.client = event['client']
    }
}
abstract class FriendEvent extends BaseEvent {
    friend: FriendInfo

    constructor(event: object) {
        super(event);
        this.friend = event['friend']
    }
}

abstract class MessageEvent extends BaseEvent {
    messageChain: MessageSegment[]

    constructor(event: object) {
        super(event);
        this.messageChain = GetMessage(event['messageChain'])
    }
}

abstract class ApplicationEvent extends BaseEvent {
    eventId: number
    fromId: number
    groupId: number
    nick: string
    message: string

    constructor(event: object) {
        super(event);
        this.eventId = event['eventId']
        this.fromId = event['fromId']
        this.groupId = event['groupId']
        this.nick = event['nick']
        this.message = event['message']
    }
}
export { BaseEvent, BotEvent, ClientEvent, FriendEvent, MessageEvent, ApplicationEvent, CommandEvent, GroupEvent, UnimplementedEvent }