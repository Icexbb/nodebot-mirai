import { FriendEvent } from "./base.js";

class FriendInputStatusChangedEvent extends FriendEvent {

    inputting: boolean

    constructor(event: object) {
        super(event);
        this.inputting = event['inputting']
    }
    toLog(): string {
        return `Friend Input Status Changed: ${this.friend.id} ${this.inputting}`
    }
}
class FriendNickChangedEvent extends FriendEvent {
    from: string
    to: string
    constructor(event: object) {
        super(event);
        this.from = event['from']
        this.to = event['to']
    }
    toLog(): string {
        return `Friend NickName Changed: ${this.friend.id} ${this.from} -> ${this.to}`
    }
}
class FriendAddEvent extends FriendEvent {
    stranger: boolean
    constructor(event: object) {
        super(event);
        this.stranger = event['stranger']
    }
    toLog(): string {
        return `Friend Added: ${this.friend.id} (stranger:${this.stranger})`
    }
}
class FriendDeleteEvent extends FriendEvent {
    constructor(event: object) { super(event); }
    toLog(): string {
        return `Friend Deleted: ${this.friend.id}`
    }
}

function GetFriendEvent(event: object): FriendEvent {
    switch (event['type']) {
        case 'FriendAddEvent': return new FriendAddEvent(event);
        case 'FriendDeleteEvent': return new FriendDeleteEvent(event);
        case 'FriendInputStatusChangedEvent': return new FriendInputStatusChangedEvent(event);
        case 'FriendNickChangedEvent': return new FriendNickChangedEvent(event);
    }
    return null;
}

export { FriendEvent, FriendAddEvent, FriendDeleteEvent, FriendInputStatusChangedEvent, FriendNickChangedEvent }
export { GetFriendEvent }