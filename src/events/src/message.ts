
import chalk from "chalk";
import { FriendInfo, GroupInfo, GroupMemberInfo, ClientInfo } from "../../class.js";
import { MessageEvent } from "./base.js";
import { FixedString } from "../../utils.js";

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
    senderInfoLog(): string {
        let nickname = this.sender.nickname
        nickname = FixedString(nickname, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.sender.id)})]`
    }
    toLog(): string {
        return `<${chalk.cyanBright(this.msgId())}> ${this.senderInfoLog()}: ${this.msgToString()}`
    }
    isSU(): boolean {
        return (this.bot.getConfig()['superuser'] as number[]).includes(this.sender.id)
    }
}

class GroupMessage extends MessageEvent {
    sender: GroupSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    senderInfoLog(): string {
        let nickname = this.sender.memberName
        nickname = FixedString(nickname, this.nameMaxLen)
        let groupName = this.sender.group.name
        groupName = FixedString(groupName, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.sender.id)}) in ${groupName}(${chalk.dim(this.sender.group.id)})]`
    }
    toLog(): string {
        return `<${chalk.cyanBright(this.msgId())}> ${this.senderInfoLog()}: ${this.msgToString()}`
    }
    isSU(): boolean {
        return (this.bot.getConfig()['superuser'] as number[]).includes(this.sender.id)
    }
}

class StrangerMessage extends MessageEvent {
    sender: StrangerSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    senderInfoLog(): string {
        let nickname = this.sender.nickname
        nickname = FixedString(nickname, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.sender.id)})]`
    }
    toLog(): string {
        return `<${chalk.cyanBright(this.msgId())}> ${this.senderInfoLog()}: ${this.msgToString()}`
    }
    isSU(): boolean {
        return (this.bot.getConfig()['superuser'] as number[]).includes(this.sender.id)
    }
}

class TempMessage extends MessageEvent {
    sender: TempSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    senderInfoLog(): string {
        let nickname = this.sender.memberName
        nickname = FixedString(nickname, this.nameMaxLen)
        let groupName = this.sender.group.name
        groupName = FixedString(groupName, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.sender.id)}) in ${groupName}(${chalk.dim(this.sender.group.id)})]`
    }
    toLog(): string {
        return `<${chalk.cyanBright(this.msgId())}> ${this.senderInfoLog()}: ${this.msgToString()}`
    }
    isSU(): boolean {
        return (this.bot.getConfig()['superuser'] as number[]).includes(this.sender.id)
    }
}

class OtherClientMessage extends MessageEvent {
    sender: OtherClientSender

    constructor(event: object) {
        super(event);
        this.sender = event['sender']
    }
    senderInfoLog(): string {
        return `[${this.sender.platform}]`
    }
    toLog(): string {
        return `<${chalk.cyanBright(this.msgId())}> ${this.senderInfoLog()}: ${this.msgToString()}`
    }
    isSU(): boolean {
        return true
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
    senderInfoLog(): string {
        let nickname = this.subject.nickname
        nickname = FixedString(nickname, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.subject.id)})]`
    }
    toLog(): string {
        return `[${this.subject.nickname}(${this.subject.id})]${chalk.cyanBright(this.msgId())}> ${this.msgToString()}`
    }
    isSU(): boolean {
        return false
    }
}

class GroupSyncMessage extends SyncMessageEvent {
    subject: GroupSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    senderInfoLog(): string {
        let groupName = this.subject.name
        groupName = FixedString(groupName, this.nameMaxLen)
        return `[${groupName}(${chalk.dim(this.subject.id)})]`
    }
    toLog(): string {
        return `${this.senderInfoLog()} <${chalk.cyanBright(this.msgId())}> ${this.msgToString()}`
    }
    isSU(): boolean {
        return false
    }
}

class TempSyncMessage extends SyncMessageEvent {
    subject: TempSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    senderInfoLog(): string {
        let nickname = this.subject.memberName
        nickname = FixedString(nickname, this.nameMaxLen)
        let groupName = this.subject.group.name
        groupName = FixedString(groupName, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.subject.id)}) in ${groupName}(${chalk.dim(this.subject.group.id)})]`
    }
    toLog(): string {
        return `${this.senderInfoLog()} <${chalk.cyanBright(this.msgId())}> ${this.msgToString()}`
    }
    isSU(): boolean {
        return false
    }
}

class StrangerSyncMessage extends SyncMessageEvent {
    subject: StrangerSubject

    constructor(event: object) {
        super(event);
        this.subject = event['subject']
    }
    senderInfoLog(): string {
        let nickname = this.subject.nickname
        nickname = FixedString(nickname, this.nameMaxLen)
        return `[${nickname}(${chalk.dim(this.subject.id)})]`
    }
    toLog(): string {
        return `${this.senderInfoLog()} <${chalk.cyanBright(this.msgId())}> ${this.msgToString()}`
    }
    isSU(): boolean {
        return false
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
