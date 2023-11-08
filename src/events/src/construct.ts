import { BaseEvent, UnimplementedEvent } from "./base.js";
import { GetClientEvent } from "./client.js";
import { GetCommandEvent } from "./command.js";
import { GetBotEvent } from "./bot.js";
import { GetFriendEvent } from "./friend.js";
import { GetGroupEvent } from "./group.js";
import { GetMessageEvent } from "./message.js";
import { GetRequestEvent } from "./request.js";
import { NodeBot } from "../../bot.js";


export function GetEvent(data: object, bot?: NodeBot): BaseEvent {
    let event: BaseEvent
    while (event === undefined) {
        event = GetBotEvent(data); if (event !== null) break;
        event = GetClientEvent(data); if (event !== null) break;
        event = GetCommandEvent(data); if (event !== null) break;
        event = GetFriendEvent(data); if (event !== null) break;
        event = GetGroupEvent(data); if (event !== null) break;
        event = GetMessageEvent(data); if (event !== null) break;
        event = GetRequestEvent(data); if (event !== null) break;
        event = new UnimplementedEvent(data);
    }
    event.registerBot(bot)
    return event;
}

