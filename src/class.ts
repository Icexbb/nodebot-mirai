export class FriendInfo {
    id: number
    nickname: string
    remark: string
}

export enum GroupPermission {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
}
export class GroupInfo {
    id: number
    name: string
    permission: GroupPermission
}
export class GroupMemberInfo {
    id: number
    memberName: string
    specialTitle: string
    permission: GroupPermission
    joinTimestamp: number
    lastSpeakTimestamp: number
    muteTimeRemaining: number
    group: GroupInfo
}
export class ClientInfo {
    id: number
    platform: string
}