import * as MessageEvent from "./message.js"
import { BaseEvent } from "./base.js";

export function GetEvent(data: object) {
    let eventType: string = data['type']
    switch (eventType) {
        case "BotOnlineEvent":
            break;
        case "BotOfflineEventActive":
            break;
        case "BotOfflineEventForce":
            break;
        case "BotOfflineEventDropped":
            break;
        case "BotReloginEvent":
            break;

        case "FriendInputStatusChangedEvent":
            break;
        case "FriendNickChangedEvent":
            break;
        case "FriendAddEvent":
            break;
        case "FriendDeleteEvent":
            break;

        case "BotGroupPermissionChangeEvent":
            break;
        case "BotMuteEvent":
            break;
        case "BotUnmuteEvent":
            break;
        case "BotJoinGroupEvent":
            break;
        case "BotLeaveEventActive":
            break;
        case "BotLeaveEventKick":
            break;
        case "BotLeaveEventDisband":
            break;
        case "GroupRecallEvent":
            break;
        case "NudgeEvent":
            break;
        case "GroupNameChangeEvent":
            break;
        case "GroupEntranceAnnouncementChangeEvent":
            break;
        case "GroupMuteAllEvent":
            break;
        case "GroupAllowAnonymousChatEvent":
            break;
        case "GroupAllowConfessTalkEvent":
            break;
        case "GroupAllowMemberInviteEvent":
            break;
        case "MemberJoinEvent":
            break;
        case "MemberLeaveEventKick":
            break;
        case "MemberLeaveEventQuit":
            break;
        case "MemberCardChangeEvent":
            break;
        case "MemberSpecialTitleChangeEvent":
            break;
        case "MemberPermissionChangeEvent":
            break;
        case "MemberMuteEvent":
            break;
        case "MemberUnmuteEvent":
            break;
        case "MemberHonorChangeEvent":
            break;

        case "NewFriendRequestEvent":
            break;
        case "MemberJoinRequestEvent":
            break;
        case "BotInvitedJoinGroupRequestEvent":
            break;

        case "OtherClientOnlineEvent":
            break;
        case "OtherClientOfflineEvent":
            break;

        case "CommandExecutedEvent":
            break;

        case "FriendMessage":
            return new MessageEvent.FriendMessageEvent(data);
        case "GroupMessage":
            return new MessageEvent.GroupMessageEvent(data);
        case "TempMessage":
            return new MessageEvent.TempMessageEvent(data);
        case "StrangerMessage":
            return new MessageEvent.StrangerMessageEvent(data);
        case "OtherClientMessage":
            return new MessageEvent.OtherClientMessageEvent(data);

        case "FriendSyncMessage":
            return new MessageEvent.FriendSyncMessageEvent(data)
        case "GroupSyncMessage":
            return new MessageEvent.GroupSyncMessageEvent(data)
        case "TempSyncMessage":
            return new MessageEvent.TempSyncMessageEvent(data)
        case "StrangerSyncMessage":
            return new MessageEvent.StrangerSyncMessageEvent(data)

    }
    return new BaseEvent(data);
}