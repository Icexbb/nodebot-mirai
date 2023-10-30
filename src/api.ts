import {MessageChain} from "./message/segment.js";

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

class AccountInfo {
    nickname: string
    email: string
    age: number
    level: number
    sign: string
    sex: Gender
}

class BaseResponse {
    code: ApiStatus
    msg: string
}

class ApiResponse extends BaseResponse {
    data: object
}

class MessageApiResponse extends BaseResponse {
    messageChain: object
}

interface PluginInfoApiCaller {
    AboutPlugin: () => ApiResponse
    GetLoginAccount: () => ApiResponse
}

interface CacheApiCaller {
    GetMessageByMessageId: (messageId: number, target: number, sessionKey?: string) => ApiResponse
}

interface AccountApiCaller {
    GetFriendList: (sessionKey?: string) => ApiResponse
    GetGroupList: (sessionKey?: string) => ApiResponse
    GetGroupMemberList: (target: number, sessionKey?: string) => ApiResponse
    GetNewGroupMemberList: (target: number, memberIds: number[], sessionKey?: string) => ApiResponse
    GetBotInfo: (sessionKey?: string) => AccountInfo
    GetFriendInfo: (target: number, sessionKey?: string) => AccountInfo
    GetGroupMemberInfo: (target: number, memberId: number, sessionKey?: string) => AccountInfo
    GetQQUserInfo: (target: number, sessionKey?: string) => AccountInfo
}


interface MessageOperationApiCaller {
    SendFriendMessage: (messageChain: MessageChain, target?: number, qq?: number, quote?: number, sessionKey?: string) => MessageApiResponse
    SendGroupMessage: (messageChain: MessageChain, target?: number, group?: number, quote?: number, sessionKey?: string) => MessageApiResponse
    SendTempMessage: (messageChain: MessageChain, qq: number, group: number, quote?: number, sessionKey?: string) => MessageApiResponse
    SendPokeMessage: (kind: string, target: number, subject: number, sessionKey?: string) => { code: ApiStatus, msg: string }
    SendWithdrawMessage: (target: number, messageId: number, sessionKey?: string) => { code: ApiStatus, msg: string }
    GetHistoryMessage: (target: number, timeStart: number, timeEnd: number) => ApiResponse
}

interface GroupFileApiCaller {

}//TODO
interface AccountManageApiCaller {

}//TODO
interface GroupManageApiCaller {

}//TODO
interface GroupAnnounceApiCaller {

}//TODO
interface ApplicationProcessApiCaller {

}//TODO
interface ConsoleCommandApiCaller {
    CommandExecute: (command: [], sessionKey?: string) => BaseResponse
    CommandRegister: (name: string, usage: string, description: string, alias?: [], sessionKey?: string) => BaseResponse
}

interface ApiCaller extends PluginInfoApiCaller, CacheApiCaller, AccountApiCaller, MessageOperationApiCaller, GroupFileApiCaller, AccountManageApiCaller, GroupManageApiCaller, GroupAnnounceApiCaller, ApplicationProcessApiCaller, ConsoleCommandApiCaller {}

// class WsApiCaller implements ApiCaller{
//
// }