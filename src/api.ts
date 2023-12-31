import * as events from "events";
import * as ws from "ws";
import chalk from "chalk";

import { MessageChain } from "./message/index.js";
import { Hash } from "./utils.js";
import { GroupPermission, GroupInfo } from "./class.js"
import { Logger } from "./logger.js";
import { NodeBot } from "./bot.js";

enum ApiStatus {
    Normal = 0,
    WrongVerifyKey = 1,
    BotNotExist = 2,
    SessionInvalid = 3,
    SessionNotCertified = 4,
    TargetNotExist = 5,
    NoPermission = 10,
    Muted = 20,
    MessageTooLong = 30,
    ErrorAccess = 400
}

enum Gender {
    UNKNOWN = "UNKNOWN",
    MALE = "MALE",
    FEMALE = "FEMALE"
}
export enum NudgeKind {
    Friend = "Friend",
    Group = "Group",
    Stranger = "Stranger"
}

class AccountInfo {
    nickname: string
    email: string
    age: number
    level: number
    sign: string
    sex: Gender
}

class EditableGroupSetting {
    name: string
    announcement: string
    confessTalk: boolean
    allowMemberInvite: boolean
    autoApprove: boolean
    anonymousChat: boolean
}
class GroupSetting extends EditableGroupSetting {
    muteAll: boolean
}
class EditableGroupMemberSetting {
    name: string
    specialTitle: string
}
class GroupMemberSetting {
    id: number
    memberName: string
    specialTitle: string
    permission: GroupPermission
    joinTimestamp: number
    lastSpeakTimestamp: number
    muteTimeRemaining: number
    group: GroupInfo
}
class Announcement {
    group: GroupInfo
    content: string
    senderId: number
    fid: string
    allConfirmed: boolean        // 是否所有群成员已确认
    confirmedMembersCount: number   // 确认群成员人数
    publicationTime: number // 发布时间
}
class BaseResponse {
    code: ApiStatus
    msg: string
}

class ApiResponse extends BaseResponse {
    data: object
}
class AnnouncementResponse extends BaseResponse {
    data: Announcement[]
}

class MessageApiResponse extends BaseResponse {
    messageId: number
}

type ApiResponseTypes = ApiResponse | AccountInfo | MessageApiResponse | BaseResponse | AnnouncementResponse | GroupSetting | GroupMemberSetting

interface PluginInfoApiCaller {
    AboutPlugin: () => Promise<ApiResponse>
    GetLoginAccount: () => Promise<ApiResponse>
}

interface CacheApiCaller {
    GetMessageByMessageId: (messageId: number, target: number, sessionKey?: string) => Promise<ApiResponse>
}

interface AccountApiCaller {
    GetFriendList: (sessionKey?: string) => Promise<ApiResponse>
    GetGroupList: (sessionKey?: string) => Promise<ApiResponse>
    GetGroupMemberList: (target: number, sessionKey?: string) => Promise<ApiResponse>
    GetNewGroupMemberList: (target: number, memberIds: number[], sessionKey?: string) => Promise<ApiResponse>
    GetBotInfo: (sessionKey?: string) => Promise<AccountInfo>
    GetFriendInfo: (target: number, sessionKey?: string) => Promise<AccountInfo>
    GetGroupMemberInfo: (target: number, memberId: number, sessionKey?: string) => Promise<AccountInfo>
    GetQQUserInfo: (target: number, sessionKey?: string) => Promise<AccountInfo>
}


interface MessageOperationApiCaller {
    SendFriendMessage: (messageChain: MessageChain, target?: number, qq?: number, quote?: number, sessionKey?: string) => Promise<MessageApiResponse>
    SendGroupMessage: (messageChain: MessageChain, target?: number, group?: number, quote?: number, sessionKey?: string) => Promise<MessageApiResponse>
    SendTempMessage: (messageChain: MessageChain, qq: number, group: number, quote?: number, sessionKey?: string) => Promise<MessageApiResponse>
    sendNudge: (kind: NudgeKind, target: number, subject: number, sessionKey?: string) => Promise<{ code: ApiStatus, msg: string }>
    Recall: (target: number, messageId: number, sessionKey?: string) => Promise<{ code: ApiStatus, msg: string }>
    GetRoamingMessages: (target: number, timeStart: number, timeEnd: number) => Promise<ApiResponse>
}

interface FileApiCaller {
    GetFileList: (id: string, path?: string, target?: number, group?: number, qq?: number, withDownloadInfo?: boolean, offset?: string, size?: 1, sessionKey?: string) => Promise<ApiResponse>;
    GetFileInfo: (id: string, path?: string, target?: number, group?: number, qq?: number, withDownloadInfo?: boolean, sessionKey?: string) => Promise<ApiResponse>;
    CreateFolder: (id: string, directoryName: string, path: string, target?: number, group?: number, qq?: number, sessionKey?: string) => Promise<ApiResponse>;
    UploadFile: () => {}//NotImplementedByMiraiWs
    DeleteFile: (id: string, path?: string, target?: number, group?: number, qq?: number, sessionKey?: string) => Promise<BaseResponse>;
    MoveFile: (id: string, path?: string, target?: number, group?: number, qq?: number, moveTo?: string, moveToPath?: string, sessionKey?: string) => Promise<BaseResponse>
    RenameFile: (id: string, renameTo?: string, path?: string, target?: number, group?: number, qq?: number, sessionKey?: string) => Promise<BaseResponse>;
}
interface AccountManageApiCaller {
    DeleteFriend: (target: number, sessionKey?: string) => Promise<BaseResponse>
}
interface GroupManageApiCaller {
    MuteGroupMember: (target: number, memberId: number, time?: number, sessionKey?: string) => Promise<BaseResponse>
    UnmuteGroupMember: (target: number, memberId: number, sessionKey?: string) => Promise<BaseResponse>
    RemoveGroupMember: (target: number, memberId: number, block?: boolean, msg?: string, sessionKey?: string) => Promise<BaseResponse>
    ExitGroup: (target: number, sessionKey?: string) => Promise<BaseResponse>
    MuteALL: (target: number, sessionKey?: string) => Promise<BaseResponse>
    UnmuteALL: (target: number, sessionKey?: string) => Promise<BaseResponse>
    SetGroupEssence: (target: number, sessionKey?: string) => Promise<BaseResponse>
    GetGroupSetting: (target: number, sessionKey?: string) => Promise<GroupSetting>
    EditGroupSetting: (target: number, setting: EditableGroupSetting, sessionKey?: string) => Promise<BaseResponse>
    GetGroupMemberSetting: (target: number, memberId: number, sessionKey?: string) => Promise<GroupMemberSetting>
    EditGroupMemberSetting: (target: number, memberId: number, setting: EditableGroupMemberSetting, sessionKey?: string) => Promise<BaseResponse>
    EditGroupAdmin: (target: number, memberId: number, assign: boolean, sessionKey?: string) => Promise<BaseResponse>
}
interface GroupAnnounceApiCaller {
    GetAnnounceList: (id: number, offset?: number, size?: number) => Promise<AnnouncementResponse>
    PublishAnnounce: (target: number, content: string, sendToNewMember?: boolean, pinned?: boolean, showEditCard?: boolean, showPopup?: boolean, requireConfirmation?: boolean, imageUrl?: string, imagePath?: string, imageBase64?: string) => Promise<AnnouncementResponse>
    DeleteAnnounce: (id: number, fid: string) => Promise<BaseResponse>
}

enum NewFriendOperate {
    accept = 0, deny = 1, denyAndBlock = 2
}
enum NewGroupMemberOperate {
    accept = 0, deny = 1, ignore = 2, denyAndBlock = 3, ignoreAndBlock = 4
}
enum BotInvitedJoinGroupOperate {
    accept = 0, deny = 1
}
interface ApplicationProcessApiCaller {
    ProcessNewFriendRequest: (eventId: number, fromId: number, groupId: number, operate: NewFriendOperate, message: string, sessionKey?: string) => Promise<BaseResponse>
    ProcessMemberJoinRequest: (eventId: number, fromId: number, groupId: number, operate: NewGroupMemberOperate, message: string, sessionKey?: string) => Promise<BaseResponse>
    ProcessBotInvitedJoinGroupRequest: (eventId: number, fromId: number, groupId: number, operate: BotInvitedJoinGroupOperate, message: string, sessionKey?: string) => Promise<BaseResponse>
}
interface ConsoleCommandApiCaller {
    CommandExecute: (command: [], sessionKey?: string) => Promise<BaseResponse>
    CommandRegister: (name: string, usage: string, description: string, alias?: [], sessionKey?: string) => Promise<BaseResponse>
}

interface ApiCallerInterface extends
    PluginInfoApiCaller,
    CacheApiCaller,
    AccountApiCaller,
    MessageOperationApiCaller,
    FileApiCaller,
    AccountManageApiCaller,
    GroupManageApiCaller,
    GroupAnnounceApiCaller,
    ApplicationProcessApiCaller,
    ConsoleCommandApiCaller {
}

export class WsApiCaller implements ApiCallerInterface {
    connection: ws.WebSocket
    sessionKey: string
    selfId: number
    waitList: string[]
    eventEmitter = new events.EventEmitter()
    apiResponseEmitter = new events.EventEmitter()
    logger: Logger;
    bot: NodeBot;

    constructor(bot: NodeBot) {
        this.bot = bot
        this.connection = this.bot.connection
        this.selfId = this.bot.qq
        this.logger = this.bot.logger
        this.waitList = []
        this.sessionKey = null
        this.connection.on("message", (event: ws.MessageEvent) => {
            let data = JSON.parse(String(event)) as { syncId: string, data: ApiResponse }
            if (this.waitList.includes(data.syncId)) {
                this.eventEmitter.emit(data.syncId, data.data)
                this.waitList.splice(this.waitList.indexOf(data.syncId), 1)
            }
        })
        this.connection.on("close", (event: ws.CloseEvent) => {
            this.registerSessionKey(null)
        })
    }

    registerSessionKey(sessionKey: string) {
        this.sessionKey = sessionKey
    }

    makeApiCall(command: string, content: object, subCommand?: string): Promise<ApiResponseTypes> {
        let syncID = Hash(command, content, subCommand ?? "")

        if (this.sessionKey !== null && content.hasOwnProperty("sessionKey") && content["sessionKey"] === undefined) {
            content["sessionKey"] = this.sessionKey
        }
        const defaultApiResolve = (data: ApiResponseTypes) => { }
        const defaultApiRejection = (data: ApiResponseTypes) => { }

        return new Promise((resolve = defaultApiResolve) => {
            this.waitList.push(syncID)
            let logsync = chalk.cyan(syncID.substring(0, 6))
            let logCommand = chalk.bold.yellowBright(command)
            this.logger.info(`API | ${logsync} | CALL ${logCommand}`)
            const data = {
                syncId: syncID,
                command: command,
                subCommand: subCommand ?? null,
                content: content
            }
            this.eventEmitter.once(syncID, (data: ApiResponse) => {
                let logRes = chalk.green(data['code']) + (data.msg ? ' message=' + data.msg : "")
                if (data.code == 0) {
                    this.logger.info(`API | ${logsync} | GET ${logCommand} result=${logRes}`)
                }
                else {
                    this.logger.error(`API | ${logsync} | GET ${logCommand} result=${logRes}`)
                }
                resolve(data);
            })
            this.connection.send(JSON.stringify(data))
        })
    }
    //PluginInfoApiCaller
    AboutPlugin() {
        return this.makeApiCall("about", {}) as Promise<ApiResponse>
    };//PASSED
    GetLoginAccount() {
        return this.makeApiCall("botList", {}) as Promise<ApiResponse>
    };//PASSED
    //CacheApiCaller
    GetMessageByMessageId(messageId: number, target: number, sessionKey?: string) {
        return this.makeApiCall("messageFromId", { messageId, target, sessionKey }) as Promise<ApiResponse>
    };//PASSED
    //AccountApiCaller
    GetFriendList(sessionKey?: string) {
        return this.makeApiCall("friendList", { sessionKey }) as Promise<ApiResponse>
    };//PASSED
    GetGroupList(sessionKey?: string) {
        return this.makeApiCall("groupList", { sessionKey }) as Promise<ApiResponse>
    };//PASSED
    GetGroupMemberList(target: number, sessionKey?: string) {
        return this.makeApiCall("memberList", { target, sessionKey }) as Promise<ApiResponse>
    };//PASSED
    GetNewGroupMemberList(target: number, memberIds: number[], sessionKey?: string) {
        return this.makeApiCall("latestMemberList", { target, memberIds, sessionKey }) as Promise<ApiResponse>
    };//PASSED
    GetBotInfo(sessionKey?: string) {
        return this.makeApiCall("botProfile", { sessionKey }) as Promise<AccountInfo>
    };//PASSED
    GetFriendInfo(target: number, sessionKey?: string) {
        return this.makeApiCall("friendProfile", { target, sessionKey }) as Promise<AccountInfo>
    };//PASSED
    GetGroupMemberInfo(target: number, memberId: number, sessionKey?: string) {
        return this.makeApiCall("memberProfile", { target, memberId, sessionKey }) as Promise<AccountInfo>
    };//PASSED
    GetQQUserInfo(target: number, sessionKey?: string) {
        return this.makeApiCall("userProfile", { target, sessionKey }) as Promise<AccountInfo>
    };//PASSED
    //MessageOperationApiCaller
    SendFriendMessage(messageChain: MessageChain, target?: number, qq?: number, quote?: number, sessionKey?: string) {
        return this.makeApiCall("sendFriendMessage", { messageChain, target, qq, quote, sessionKey }) as Promise<MessageApiResponse>
    };//PASSED
    SendGroupMessage(messageChain: MessageChain, target?: number, group?: number, quote?: number, sessionKey?: string) {
        return this.makeApiCall("sendGroupMessage", { messageChain, target, group, quote, sessionKey }) as Promise<MessageApiResponse>
    }//PASSED
    SendTempMessage(messageChain: MessageChain, qq: number, group: number, quote?: number, sessionKey?: string) {
        return this.makeApiCall("sendTempMessage", { messageChain, qq, group, quote, sessionKey }) as Promise<MessageApiResponse>
    };//NOTTEST
    sendNudge(kind: NudgeKind, target: number, subject: number, sessionKey?: string) {
        return this.makeApiCall("sendNudge", { kind, target, subject, sessionKey }) as Promise<{ code: ApiStatus, msg: string }>
    };//PASSED
    Recall(target: number, messageId: number, sessionKey?: string) {
        return this.makeApiCall("recall", { target, messageId, sessionKey }) as Promise<{ code: ApiStatus, msg: string }>
    };//PASSED
    GetRoamingMessages(target: number, timeStart: number, timeEnd: number) {
        return this.makeApiCall("roamingMessages", { target, timeStart, timeEnd }) as Promise<ApiResponse>
    };//PASSED
    //FileApiCaller
    GetFileList(id: string, path?: string, target?: number, group?: number, qq?: number, withDownloadInfo?: boolean, offset?: string, size?: 1, sessionKey?: string) {
        return this.makeApiCall("file_list", { id, path, target, group, qq, withDownloadInfo, offset, size, sessionKey }) as Promise<ApiResponse>
    }//PASSED
    GetFileInfo(id: string, path?: string, target?: number, group?: number, qq?: number, withDownloadInfo?: boolean, sessionKey?: string) {
        return this.makeApiCall("file_info", { id, path, target, group, qq, withDownloadInfo, sessionKey }) as Promise<ApiResponse>
    };//PASSED
    CreateFolder(id: string, directoryName: string, path: string, target?: number, group?: number, qq?: number, sessionKey?: string) {
        return this.makeApiCall("file_mkdir", { id, directoryName, path, target, group, qq, sessionKey }) as Promise<ApiResponse>
    };//PASSED
    UploadFile: () => {};//NOTTEST
    DeleteFile(id: string, path?: string, target?: number, group?: number, qq?: number, sessionKey?: string) {
        return this.makeApiCall("file_delete", { id, path, target, group, qq, sessionKey }) as Promise<BaseResponse>
    };//NOTTEST
    MoveFile(id: string, path?: string, target?: number, group?: number, qq?: number, moveTo?: string, moveToPath?: string, sessionKey?: string) {
        return this.makeApiCall("file_move", { id, path, target, group, qq, moveTo, moveToPath, sessionKey }) as Promise<BaseResponse>
    };//NOTTEST
    RenameFile(id: string, renameTo?: string, path?: string, target?: number, group?: number, qq?: number, sessionKey?: string) {
        return this.makeApiCall("file_rename", { id, renameTo, path, target, group, qq, sessionKey }) as Promise<BaseResponse>
    };//NOTTEST
    //AccountManageApiCaller
    DeleteFriend(target: number, sessionKey?: string) {
        return this.makeApiCall("deleteFriend", { target, sessionKey }) as Promise<BaseResponse>
    };
    //GroupManageApiCaller
    MuteGroupMember(target: number, memberId: number, time?: number, sessionKey?: string) {
        return this.makeApiCall("mute", { target, memberId, time, sessionKey }) as Promise<BaseResponse>
    };//PASSED
    UnmuteGroupMember(target: number, memberId: number, sessionKey?: string) {
        return this.makeApiCall("unmute", { target, memberId, sessionKey }) as Promise<BaseResponse>
    };//PASSED
    RemoveGroupMember(target: number, memberId: number, block?: boolean, msg?: string, sessionKey?: string) {
        return this.makeApiCall("kick", { target, memberId, block, msg, sessionKey }) as Promise<BaseResponse>
    };//NOTTEST
    ExitGroup(target: number, sessionKey?: string) {
        return this.makeApiCall("quit", { target, sessionKey }) as Promise<BaseResponse>
    }//PASSED
    MuteALL(target: number, sessionKey?: string) {
        return this.makeApiCall("muteAll", { target, sessionKey }) as Promise<BaseResponse>
    };//PASSED
    UnmuteALL(target: number, sessionKey?: string) {
        return this.makeApiCall("unmuteAll", { target, sessionKey }) as Promise<BaseResponse>
    };//PASSED
    SetGroupEssence(target: number, sessionKey?: string) {
        return this.makeApiCall("setEssence", { target, sessionKey }) as Promise<BaseResponse>
    };
    GetGroupSetting(target: number, sessionKey?: string) {
        return this.makeApiCall("groupConfig", { target, sessionKey }, "get") as Promise<GroupSetting>
    };//PASSED
    EditGroupSetting(target: number, setting: EditableGroupSetting, sessionKey?: string) {
        return this.makeApiCall("groupConfig", { target, setting, sessionKey }, "update") as Promise<BaseResponse>
    };
    GetGroupMemberSetting(target: number, memberId: number, sessionKey?: string) {
        return this.makeApiCall("memberInfo", { target, memberId, sessionKey }, "get") as Promise<GroupMemberSetting>
    };//PASSED
    EditGroupMemberSetting(target: number, memberId: number, setting: EditableGroupMemberSetting, sessionKey?: string) {
        return this.makeApiCall("memberInfo", { target, memberId, setting, sessionKey }, "update") as Promise<BaseResponse>
    };
    EditGroupAdmin(target: number, memberId: number, assign: boolean, sessionKey?: string) {
        return this.makeApiCall("memberAdmin", { target, memberId, assign, sessionKey }) as Promise<BaseResponse>
    };

    //GroupAnnounceApiCaller
    GetAnnounceList(id: number, offset?: number, size?: number) {
        return this.makeApiCall("anno_list", { id, offset, size }) as Promise<AnnouncementResponse>
    };//PASSED
    PublishAnnounce(target: number, content: string, sendToNewMember?: boolean, pinned?: boolean, showEditCard?: boolean, showPopup?: boolean, requireConfirmation?: boolean, imageUrl?: string, imagePath?: string, imageBase64?: string) {
        return this.makeApiCall("anno_publish", { target, content, sendToNewMember, pinned, showEditCard, showPopup, requireConfirmation, imageUrl, imagePath, imageBase64 }) as Promise<AnnouncementResponse>
    };
    DeleteAnnounce(id: number, fid: string) {
        return this.makeApiCall("anno_delete", { id, fid }) as Promise<BaseResponse>
    };
    //ApplicationProcessApiCaller
    ProcessNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: NewFriendOperate, message: string, sessionKey?: string) {
        return this.makeApiCall("resp_newFriendRequestEvent", { eventId, fromId, groupId, operate, message, sessionKey }) as Promise<BaseResponse>
    };
    ProcessMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: NewGroupMemberOperate, message: string, sessionKey?: string) {
        return this.makeApiCall("resp_memberJoinRequestEvent", { eventId, fromId, groupId, operate, message, sessionKey }) as Promise<BaseResponse>
    };
    ProcessBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: BotInvitedJoinGroupOperate, message: string, sessionKey?: string) {
        return this.makeApiCall("resp_botInvitedJoinGroupRequestEvent", { eventId, fromId, groupId, operate, message, sessionKey }) as Promise<BaseResponse>
    };

    //ConsoleCommandApiCaller
    CommandExecute(command: [], sessionKey?: string) {
        return this.makeApiCall("cmd_execute", { command, sessionKey }) as Promise<BaseResponse>
    };
    CommandRegister(name: string, usage: string, description: string, alias?: [], sessionKey?: string) {
        return this.makeApiCall("cmd_register", { name, usage, description, alias, sessionKey }) as Promise<BaseResponse>
    };
}
