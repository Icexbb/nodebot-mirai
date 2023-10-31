import { BotEvent } from "./base.js";

class BotOnlineEvent extends BotEvent {
    constructor(event: object) { super(event); }
    toLog(): string { return `Bot Online: ${this.qq}` }
}
class BotOfflineEventForce extends BotEvent {
    constructor(event: object) { super(event); }
    toLog(): string { return `Bot Offline By Force: ${this.qq}` }
}

class BotOfflineEventDropped extends BotEvent {
    constructor(event: object) { super(event); }
    toLog(): string { return `Bot Offline By Accident: ${this.qq}` }
}
class BotReloginEvent extends BotEvent {
    constructor(event: object) { super(event); }
    toLog(): string { return `Bot Re-Login Successfully: ${this.qq}` }
}

function GetBotEvent(event: object): BotEvent {
    switch (event['type']) {
        case 'BotOnlineEvent': return new BotOnlineEvent(event);
        case "BotOfflineEventForce": return new BotOfflineEventForce(event);
        case "BotOfflineEventDropped": return new BotOfflineEventDropped(event);
        case "BotReloginEvent": return new BotReloginEvent(event);
    }
    return null;
}

export { GetBotEvent }
export { BotOnlineEvent, BotOfflineEventForce, BotOfflineEventDropped, BotReloginEvent }
