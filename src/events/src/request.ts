import { ApplicationEvent } from "./base.js";

class NewFriendRequestEvent extends ApplicationEvent {
    constructor(event: object) { super(event); }
    toLog(): string {
        return `New Friend Request [${this.nick}(${this.fromId}) ${this.groupId ? ' from ' + this.groupId.toString() : ""}]: ${this.message}`
    }
}
class MemberJoinRequestEvent extends ApplicationEvent {
    groupName: string
    invitorId: number
    constructor(event: object) {
        super(event);
        this.groupName = event['groupName']
        this.invitorId = event['invitorId']
    }
    toLog(): string {
        return `Member Join Request [${this.nick}(${this.fromId}) to ${this.groupId} ${this.groupId ? ' invited by ' + this.groupId.toString() : ""}]: ${this.message}`
    }
}
class BotInvitedJoinGroupRequestEvent extends ApplicationEvent {
    groupName: string
    constructor(event: object) {
        super(event);
        this.groupName = event['groupName']
    }
    toLog(): string {
        return `Bot was Invited To Join Group [${this.nick}(${this.fromId}) ${this.groupId ? ' from ' + this.groupId.toString() : ""}]: ${this.message}`
    }
}

function GetRequestEvent(event: object): ApplicationEvent {
    switch (event['type']) {
        case "NewFriendRequestEvent": return new NewFriendRequestEvent(event);
        case "MemberJoinRequestEvent": return new MemberJoinRequestEvent(event);
        case "BotInvitedJoinGroupRequestEvent": return new BotInvitedJoinGroupRequestEvent(event);
    }
    return null;
}

export { GetRequestEvent }
export { NewFriendRequestEvent, MemberJoinRequestEvent, BotInvitedJoinGroupRequestEvent }