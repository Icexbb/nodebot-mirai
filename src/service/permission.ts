import { BaseEvent } from "../events/index.js";
import { ConfiguredBotObject } from "../class.js";

export enum PermissionLevel {
    block = -1,
    NA = 0,
    normal = 1,
    admin = 2,
    owner = 3,
    self = 5,
    su = 10
}

export class EventPremissionSolver extends ConfiguredBotObject {
    event: BaseEvent
    userPermission: PermissionLevel
    groupPermission: PermissionLevel

    getGroupConfig = function (groupId: number): PermissionLevel {
        let config = this.getConfig()
        if (!config['group']) config['group'] = {}
        let permission = config['group'][groupId.toString()] as PermissionLevel ?? PermissionLevel.normal
        config['group'][groupId.toString()] = permission
        this.setConfig(config)
        return permission
    }
    getMemberConfig = function (groupId: number, memberId: number): PermissionLevel {
        let config = this.getConfig()
        if (!config['member']) config['member'] = {}
        if (!config['member'][groupId.toString()]) config['member'][groupId.toString()] = {}
        let permission = config['member'][groupId.toString()][memberId.toString()] as PermissionLevel ?? PermissionLevel.normal
        config['member'][groupId.toString()][memberId.toString()] = permission
        this.setConfig(config)

        return permission
    }
    getIndividualConfig = function (memberId: number): PermissionLevel {
        let config = this.getConfig()
        if (!config['individual']) config['individual'] = {}
        let permission = config['individual'][memberId.toString()] as PermissionLevel ?? PermissionLevel.normal
        config['individual'][memberId.toString()] = permission
        this.setConfig(config)

        return permission
    }
    constructor(event: BaseEvent) {
        super("permission","permission")

        this.event = event;
        let senderId = event['sender']?.id
        let groupId = event['sender']?.group?.id
        let isBot = event['subject'] ? true : false
        if (isBot) {
            this.userPermission = PermissionLevel.self
        } else if (senderId) {
            this.userPermission = Math.min(this.getIndividualConfig(senderId), this.getMemberConfig(groupId, senderId))
        } else {
            this.userPermission = PermissionLevel.NA
        }
        if (groupId) {
            this.groupPermission = this.getGroupConfig(groupId)
        } else {
            this.groupPermission = PermissionLevel.NA
        }
    }
}