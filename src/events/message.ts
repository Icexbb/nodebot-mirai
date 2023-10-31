import {BaseEvent} from "./base.js";
import {MessageSegment} from "../message/segment.js";
import {GetMessage} from "../message/message.js"

class FriendSender {
    id: number
    nickname: string
    remark: string
}

type StrangerSender = FriendSender

enum GroupPermission {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
}

class GroupInfo {
    id: number
    name: string
    permission: GroupPermission
}

class GroupSender {
    id: number
    memberName: string
    specialTitle: string
    permission: GroupPermission
    joinTimestamp: number
    lastSpeakTimestamp: number
    muteTimeRemaining: number
    group: GroupInfo
}

type TempSender = GroupSender

class OtherClientSender {
    id: number
    platform: string
}

type Sender = FriendSender | StrangerSender | GroupSender | TempSender | OtherClientSender

class MessageEvent extends BaseEvent {
    messageChain: MessageSegment[]

    constructor(event: object) {
        super(event);
        this.messageChain = GetMessage(event['messageChain'])
    }
}


class FriendMessageEvent extends MessageEvent {
    sender: FriendSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
}

class GroupMessageEvent extends MessageEvent {
    sender: GroupSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
}

class StrangerMessageEvent extends MessageEvent {
    sender: StrangerSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
}

class TempMessageEvent extends MessageEvent {
    sender: GroupSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
}

class OtherClientMessageEvent extends MessageEvent {
    sender: GroupSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
}

class GroupSubject {
    id: number
    name: string
    permission: GroupPermission
}

type FriendSubject = FriendSender
type TempSubject = GroupSender
type StrangerSubject = FriendSubject

class SyncMessageEvent extends BaseEvent {
    messageChain: MessageSegment[]

    constructor(event: object) {
        super(event);
        this.messageChain = event['messageChain']
    }
}

class FriendSyncMessageEvent extends SyncMessageEvent {
    subject: FriendSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
}

class GroupSyncMessageEvent extends SyncMessageEvent {
    subject: GroupSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
}

class TempSyncMessageEvent extends SyncMessageEvent {
    subject: TempSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
}

class StrangerSyncMessageEvent extends SyncMessageEvent {
    subject: StrangerSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
}
export {GroupInfo,GroupPermission}
export {GroupMessageEvent,FriendMessageEvent,StrangerMessageEvent,TempMessageEvent,OtherClientMessageEvent}
export {GroupSyncMessageEvent,FriendSyncMessageEvent,TempSyncMessageEvent,StrangerSyncMessageEvent}
