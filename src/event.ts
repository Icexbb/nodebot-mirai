import { BaseEvent, UnimplementedEvent } from "./events/base.js";
import { GetClientEvent } from "./events/client.js";
import { GetCommandEvent } from "./events/command.js";
import { GetBotEvent } from "./events/bot.js";
import { GetFriendEvent } from "./events/friend.js";
import { GetGroupEvent } from "./events/group.js";
import { GetMessageEvent } from "./events/message.js";
import { GetRequestEvent } from "./events/request.js";

export function GetEvent(data: object): BaseEvent {
    let event: BaseEvent

    event = GetBotEvent(data); if (event !== null) { return event }
    event = GetClientEvent(data); if (event !== null) { return event }
    event = GetCommandEvent(data); if (event !== null) { return event }
    event = GetFriendEvent(data); if (event !== null) { return event }
    event = GetGroupEvent(data); if (event !== null) { return event }
    event = GetMessageEvent(data); if (event !== null) { return event }
    event = GetRequestEvent(data); if (event !== null) { return event }
    return new UnimplementedEvent(data);
}