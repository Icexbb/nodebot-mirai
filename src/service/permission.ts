import { BaseEvent, FriendMessage, GroupMessage } from "../events/index.js";
import { ConfiguredBotObject, GroupInfo, GroupMemberInfo, GroupPermission } from "../class.js";

export enum PermissionLevel {
    block = -1,
    NA = 0,
    normal = 1,
    admin = 2,
    owner = 3,
    white = 5,
    self = 5,
    su = 10
}

export class EventPremissionSolver extends ConfiguredBotObject {
    event: BaseEvent
    userPermission: PermissionLevel
    groupPermission: PermissionLevel

    getGroupConfig = function (groupId: number): PermissionLevel {
        let config = this.getConfig()
        let modified = false

        if (!config['group']) {
            modified = true
            config['group'] = {}
        }
        let permission = config['group'][groupId.toString()] as PermissionLevel ??
            (() => { modified = true; return PermissionLevel.normal })()
        if (modified) {
            config['group'][groupId.toString()] = permission
            this.setConfig(config)
        }
        return permission
    }
    getMemberConfig = function (groupId: number, memberId: number): PermissionLevel {
        let config = this.getConfig()
        let modified = false
        let gInfo: GroupMemberInfo = this.event.sender;
        if (!config['member']) {
            modified = true
            config['member'] = {}
        }
        if (!config['member'][groupId.toString()]) {
            modified = true
            config['member'][groupId.toString()] = {}
        }
        let permission = config['member'][groupId.toString()][memberId.toString()] as PermissionLevel ??
            (() => { modified = true; return PermissionLevel.normal })()
        if (permission > 0) {
            switch (gInfo.permission) {
                case GroupPermission.MEMBER:
                    if (permission < PermissionLevel.white) { modified = true; permission = PermissionLevel.normal; }
                    break;
                case GroupPermission.ADMIN:
                    if (permission < PermissionLevel.white) { modified = true; permission = PermissionLevel.admin; }
                    break;
                case GroupPermission.OWNER:
                    if (permission < PermissionLevel.white) { modified = true; permission = PermissionLevel.owner; }
                    break;
            }
        }
        if (modified) {
            config['member'][groupId.toString()][memberId.toString()] = permission
            this.setConfig(config)
        }
        return permission
    }
    getIndividualConfig = function (memberId: number): PermissionLevel {
        let config = this.getConfig()
        let modified = false;
        if (!config['individual']) {
            config['individual'] = {}
            modified = true
        }
        let permission = config['individual'][memberId.toString()] as PermissionLevel ??
            (() => { modified = true; return PermissionLevel.normal })()
        if (permission != PermissionLevel.su)
            if ((this.event.bot.getConfig()['superuser'] as number[]).includes(memberId)) {
                console.log(this.event.bot.getConfig()['superuser'].includes(memberId))
                modified = true
                permission = PermissionLevel.su
            }

        if (modified) {
            config['individual'][memberId.toString()] = permission
            this.setConfig(config)
        }

        return permission
    }
    constructor(event: FriendMessage | GroupMessage) {
        super("permission", "permission")
        this.event = event;
        let senderId: number = event.sender.id

        if (event instanceof GroupMessage) {
            let groupId: number = event.sender.group.id
            this.groupPermission = this.getGroupConfig(groupId)
            this.userPermission = this.getMemberConfig(groupId, senderId)
        } else if (event instanceof FriendMessage) {
            this.userPermission = this.getIndividualConfig(senderId)
            this.groupPermission = PermissionLevel.NA
        }
    }
}