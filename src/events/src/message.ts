
import { FriendInfo, GroupInfo, GroupMemberInfo, ClientInfo } from "../../class.js";
import { MessageEvent } from "./base.js";

type FriendSender = FriendInfo
type StrangerSender = FriendSender
type GroupSender = GroupMemberInfo
type TempSender = GroupSender
type OtherClientSender = ClientInfo

type Sender = FriendSender | StrangerSender | GroupSender | TempSender | OtherClientSender

class FriendMessage extends MessageEvent {

    sender: FriendSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `<== ${this.msgId()} [${this.sender.nickname}(${this.sender.id})]: ${this.msgToString()}`
    }
}

class GroupMessage extends MessageEvent {

    sender: GroupSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `<== ${this.msgId()} [${this.sender.memberName}(${this.sender.id}) in ${this.sender.group.name}(${this.sender.group.id})]: ${this.msgToString()}`
    }
}

class StrangerMessage extends MessageEvent {
    sender: StrangerSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `<== ${this.msgId()} [${this.sender.nickname}(${this.sender.id})]: ${this.msgToString()}`
    }
}

class TempMessage extends MessageEvent {
    sender: TempSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `<== ${this.msgId()} [${this.sender.memberName}(${this.sender.id}) in ${this.sender.group.name}(${this.sender.group.id})]: ${this.msgToString()}`
    }
}

class OtherClientMessage extends MessageEvent {
    sender: OtherClientSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    toLog(): string {
        return `<== ${this.msgId()} [${this.sender.platform}]: ${this.msgToString()}`
    }
}

type GroupSubject = GroupInfo
type FriendSubject = FriendSender
type TempSubject = GroupSender
type StrangerSubject = FriendSubject

abstract class SyncMessageEvent extends MessageEvent {
    constructor(event: object) { super(event); }
}

class FriendSyncMessage extends SyncMessageEvent {
    subject: FriendSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `==> ${this.msgId()} [${this.subject.nickname}(${this.subject.id})]=> ${this.msgToString()}`
    }
}

class GroupSyncMessage extends SyncMessageEvent {
    subject: GroupSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `==> ${this.msgId()} [${this.subject.name}(${this.subject.id})]=> ${this.msgToString()}`
    }
}

class TempSyncMessage extends SyncMessageEvent {
    subject: TempSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `==> ${this.msgId()} [${this.subject.memberName}(${this.subject.id}) in ${this.subject.group.name}(${this.subject.group.id})]=> ${this.msgToString()}`
    }
}

class StrangerSyncMessage extends SyncMessageEvent {
    subject: StrangerSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    toLog(): string {
        return `==> ${this.msgId()} [${this.subject.nickname}(${this.subject.id})]=> ${this.msgToString()}`
    }
}

function GetMessageEvent(event: object): MessageEvent {
    switch (event['type']) {
        case 'GroupMessage': return new GroupMessage(event);
        case 'FriendMessage': return new FriendMessage(event);
        case 'StrangerMessage': return new StrangerMessage(event);
        case 'TempMessage': return new TempMessage(event);
        case 'OtherClientMessage': return new OtherClientMessage(event);
        case 'GroupSyncMessage': return new GroupSyncMessage(event);
        case 'FriendSyncMessage': return new FriendSyncMessage(event);
        case 'TempSyncMessage': return new TempSyncMessage(event);
        case 'StrangerSyncMessage': return new StrangerSyncMessage(event);
    }
    return null;
}

export { GetMessageEvent }
export { GroupMessage, FriendMessage, StrangerMessage, TempMessage, OtherClientMessage }
export { GroupSyncMessage, FriendSyncMessage, TempSyncMessage, StrangerSyncMessage }
