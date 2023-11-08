import { ClientInfo, FriendInfo } from "../../class.js"
import { GetMessage } from "../../message/src/construct.js"
import { MessageSegment } from "../../message/src/base.js"
import * as Segments from "../../message/src/segment.js"
import { NodeBot } from "../../bot.js"
abstract class BaseEvent {
    type: string
    rawData: object
    bot: NodeBot
    constructor(event: object) {
        this.type = event['type']
        this.rawData = event
    }
    registerBot(bot: NodeBot) {
        this.bot = bot
    }
    abstract toLog(): string

    getSelfId(): number {
        if (this.bot === undefined) throw new Error("Bot not set")
        return this.bot.qq
    }
    getSelfNames(): string[] {
        if (this.bot === undefined) throw new Error("Bot not set")
        return this.bot.getConfig()['name'] ?? []
    }
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
    rawMessage: object

    protected constructor(event: object) {
        super(event);
        this.messageChain = GetMessage(event['messageChain'])
        this.rawMessage = event['messageChain']
    }
    msgContent(): MessageSegment[] {
        return this.messageChain.filter((seg) => { return seg.type != "Source" })
    }
    msgToString(): string {
        return this.messageChain.map((seg) => { try { return seg.toLog() } catch { return `[${seg.type}]` } }).join('')
    }
    msgId(): number {
        return (this.messageChain[0] as Segments.Source).id ?? -1
    }
    extraPlainMsg(): string {
        return this.messageChain.filter((seg) => { return seg.type == "Plain" }).map((seg: Segments.Plain) => { return seg.text }).join('')
    }
    equals(other: MessageSegment[]): boolean {
        let selfContent = this.msgContent()
        if (selfContent.length != other.length) return false;
        for (let i = 0; i < selfContent.length; i++) {
            if (!selfContent[i].equals(other[i])) return false;
        }
        return true;
    }
    isToMe() {
        return this.messageChain.some((item) => {
            switch (item.type) {
                case "At":
                    return (item as Segments.At).target == this.getSelfId()
                case "AtAll":
                    return true
                case "Plain":
                    return (this.getSelfNames()).some((name) => {
                        return (item as Segments.Plain).text.toLowerCase().includes(name.toLowerCase())
                    })
                case "Quote":
                    return (item as Segments.Quote).senderId == this.getSelfId()
                default:
                    return false
            }
        })
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