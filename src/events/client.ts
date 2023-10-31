import { ClientEvent } from "./base.js";

class OtherClientOnlineEvent extends ClientEvent {
    kind: number
    constructor(event: object) { super(event); this.kind = event['kind'] }
    toLog(): string { return `Other Client Online: ${this.client.platform}` }
}
class OtherClientOfflineEvent extends ClientEvent {
    constructor(event: object) { super(event); }
    toLog(): string { return `Other Client Offline: ${this.client.platform}` }
}

function GetClientEvent(event: object): ClientEvent {
    switch (event['type']) {
        case "OtherClientOnlineEvent": return new OtherClientOnlineEvent(event);
        case "OtherClientOfflineEvent": return new OtherClientOfflineEvent(event);
    }
    return null;
}

export { GetClientEvent }
export { OtherClientOnlineEvent, OtherClientOfflineEvent }