
import { FriendInfo, GroupInfo, GroupMemberInfo, ClientInfo } from "../class.js";
import { MessageEvent } from "./base.js";

type FriendSender = FriendInfo
type StrangerSender = FriendSender
type GroupSender = GroupMemberInfo
type TempSender = GroupSender
type OtherClientSender = ClientInfo

type Sender = FriendSender | StrangerSender | GroupSender | TempSender | OtherClientSender

class FriendMessageEvent extends MessageEvent {

    sender: FriendSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `Friend Message [${this.sender.nickname}(${this.sender.id})]: ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class GroupMessageEvent extends MessageEvent {

    sender: GroupSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `Group Message [${this.sender.memberName}(${this.sender.id}) in ${this.sender.group.name}(${this.sender.group.id})]: ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class StrangerMessageEvent extends MessageEvent {
    sender: StrangerSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `Stranger Message [${this.sender.nickname}(${this.sender.id})]: ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class TempMessageEvent extends MessageEvent {
    sender: TempSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `Temp Message [${this.sender.memberName}(${this.sender.id}) in ${this.sender.group.name}(${this.sender.group.id})]: ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class OtherClientMessageEvent extends MessageEvent {
    sender: OtherClientSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `Other Client Message [${this.sender.platform}]: ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

type GroupSubject = GroupInfo
type FriendSubject = FriendSender
type TempSubject = GroupSender
type StrangerSubject = FriendSubject

abstract class SyncMessageEvent extends MessageEvent {
    constructor(event: object) { super(event); }
}

class FriendSyncMessageEvent extends SyncMessageEvent {
    subject: FriendSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `Friend Message Sync [${this.subject.nickname}(${this.subject.id})]=> ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class GroupSyncMessageEvent extends SyncMessageEvent {
    subject: GroupSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `Group Message Sync [${this.subject.name}(${this.subject.id})]=> ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class TempSyncMessageEvent extends SyncMessageEvent {
    subject: TempSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `Temp Message Sync [${this.subject.memberName}(${this.subject.id}) in ${this.subject.group.name}(${this.subject.group.id})]=> ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

class StrangerSyncMessageEvent extends SyncMessageEvent {
    subject: StrangerSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `Stranger Message Sync [${this.subject.nickname}(${this.subject.id})]=> ${this.messageChain.map((seg) => seg.toLog()).join('')}`
    }
}

function GetMessageEvent(event: object): MessageEvent {
    switch (event['type']) {
        case 'GroupMessage': return new GroupMessageEvent(event);
        case 'FriendMessage': return new FriendMessageEvent(event);
        case 'StrangerMessage': return new StrangerMessageEvent(event);
        case 'TempMessage': return new TempMessageEvent(event);
        case 'OtherClientMessage': return new OtherClientMessageEvent(event);
        case 'GroupMessageSync': return new GroupSyncMessageEvent(event);
        case 'FriendMessageSync': return new FriendSyncMessageEvent(event);
        case 'TempMessageSync': return new TempSyncMessageEvent(event);
        case 'StrangerMessageSync': return new StrangerSyncMessageEvent(event);
    }
    return null;
}

export { GetMessageEvent }
export { GroupMessageEvent, FriendMessageEvent, StrangerMessageEvent, TempMessageEvent, OtherClientMessageEvent }
export { GroupSyncMessageEvent, FriendSyncMessageEvent, TempSyncMessageEvent, StrangerSyncMessageEvent }
