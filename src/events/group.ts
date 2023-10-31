import { GroupInfo, GroupMemberInfo, GroupPermission } from "../class.js";
import { BaseEvent } from "./base.js";

class BotGroupPermissionChangeEvent extends BaseEvent {
    origin: GroupPermission
    current: GroupPermission
    group: GroupInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
    }
    toLog(): string {
        return `Bot Group Permission Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}
class BotMuteEvent extends BaseEvent {
    durationSeconds: number
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.durationSeconds = event['durationSeconds']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Bot Has been Muted For ${this.durationSeconds} seconds in Group ${this.operator.group.id} by ${this.operator.id}`
    }
}
class BotUnmuteEvent extends BaseEvent {
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.operator = event['operator']
    }
    toLog(): string {
        return `Bot Has been Unmuted in Group ${this.operator.group.id} by ${this.operator.id}`
    }
}
class BotJoinGroupEvent extends BaseEvent {
    group: GroupInfo
    invitor: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.group = event['group']
        this.invitor = event['invitor']
    }
    toLog(): string {
        return `Bot Joined Group ${this.group.id} by ${this.invitor.id}`
    }
}
class BotLeaveEventActive extends BaseEvent {
    group: GroupInfo
    constructor(event: object) {
        super(event);
        this.group = event['group']
    }
    toLog(): string {
        return `Bot Left Group ${this.group.id} by itself`
    }
}
class BotLeaveEventKick extends BaseEvent {
    group: GroupInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.group = event['group']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Bot was Kicked From Group ${this.group.id} by ${this.operator.id}`
    }
}
class GroupRecallEvent extends BaseEvent {
    operator: GroupMemberInfo
    authorId: number
    messageId: number
    time: number
    group: GroupInfo
    constructor(event: object) {
        super(event);
        this.operator = event['operator']
        this.authorId = event['authorId']
        this.messageId = event['messageId']
        this.group = event['group']
        this.time = event['time']
    }
    toLog(): string {
        return `Message ${this.messageId} in Group ${this.group.id} was recalled by ${this.operator.id}`
    }
}
class FriendRecallEvent extends BaseEvent {
    operator: number
    authorId: number
    messageId: number
    time: number
    constructor(event: object) {
        super(event);
        this.operator = event['operator']
        this.authorId = event['authorId']
        this.messageId = event['messageId']
        this.time = event['time']
    }
    toLog(): string {
        return `Message ${this.messageId} of Friend ${this.operator} was recalled by ${this.operator}`
    }
}
class NudgeEvent extends BaseEvent {
    fromId: number
    subject: { id: number, kind: "Group" | 'Friend' }
    action: string
    suffix: string
    target: number
    constructor(event: object) {
        super(event);
        this.fromId = event['fromId']
        this.subject = event['subject']
        this.action = event['action']
        this.suffix = event['suffix']
        this.target = event['target']
    }
    toLog(): string {
        return `Nudge ${this.subject.kind} from ${this.subject.id} to ${this.target}`
    }
}
class GroupNameChangeEvent extends BaseEvent {
    origin: string
    current: string
    group: GroupInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Group Name Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}
class GroupEntranceAnnouncementChangeEvent extends BaseEvent {
    origin: string
    current: string
    group: GroupInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Group Entrance Announcement Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}
class GroupMuteAllEvent extends BaseEvent {
    origin: boolean
    current: boolean
    group: GroupInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Group Mute-All Status Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}
class GroupAllowAnonymousChatEvent extends BaseEvent {
    origin: boolean
    current: boolean
    group: GroupInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Group Anonymous Policy Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}
class GroupAllowConfessTalkEvent extends BaseEvent {
    origin: boolean
    current: boolean
    group: GroupInfo
    isByBot: boolean
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
        this.isByBot = event['isByBot']
    }
    toLog(): string {
        return `Group Confess Talk Policy Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}
class GroupAllowMemberInviteEvent extends BaseEvent {
    origin: boolean
    current: boolean
    group: GroupInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.group = event['group']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Group Member Invite Policy Changed: ${this.group.id} ${this.origin} -> ${this.current}`
    }
}

class MemberJoinEvent extends BaseEvent {
    member: GroupMemberInfo
    invitor: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.member = event['member']
        this.invitor = event['invitor']
    }
    toLog(): string {
        return `Member ${this.member.id} Joined Group ${this.member.group.id} by ${this.invitor.id}`
    }
}
class MemberLeaveEventKick extends BaseEvent {
    member: GroupMemberInfo
    operator: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.member = event['member']
        this.operator = event['operator']
    }
    toLog(): string {
        return `Member ${this.member.id} was Kicked From Group ${this.member.group.id} by ${this.operator.id}`
    }
}
class MemberLeaveEventQuit extends BaseEvent {
    member: { id: number, memberName: string, premission: GroupPermission, group: GroupInfo }
    constructor(event: object) {
        super(event);
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id} Quit Group ${this.member.group.id}`
    }
}
class MemberCardChangeEvent extends BaseEvent {
    origin: string
    current: string
    member: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id}'s Card in Group ${this.member.group.id} Changed: ${this.origin} -> ${this.current}`
    }
}
class MemberSpecialTitleChangeEvent extends BaseEvent {
    origin: string
    current: string
    member: { id: number, memberName: string, premission: GroupPermission, group: GroupInfo }
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id}'s Special Title in Group ${this.member.group.id} Changed: ${this.origin} -> ${this.current}`
    }
}
class MemberPermissionChangeEvent extends BaseEvent {
    origin: GroupPermission
    current: GroupPermission
    member: { id: number, memberName: string, premission: GroupPermission, group: GroupInfo }
    constructor(event: object) {
        super(event);
        this.origin = event['origin']
        this.current = event['current']
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id}'s Permission in Group ${this.member.group.id} Changed: ${this.origin} -> ${this.current}`
    }
}
class MemberMuteEvent extends BaseEvent {
    durationSeconds: number
    operator: GroupMemberInfo
    member: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.durationSeconds = event['durationSeconds']
        this.operator = event['operator']
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id} was Muted For ${this.durationSeconds} seconds in Group ${this.operator.group.id} by ${this.operator.id}`
    }
}

class MemberUnmuteEvent extends BaseEvent {
    operator: GroupMemberInfo
    member: GroupMemberInfo
    constructor(event: object) {
        super(event);
        this.operator = event['operator']
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id} was Unmuted in Group ${this.operator.group.id} by ${this.operator.id}`
    }
}
class MemberHonorChangeEvent extends BaseEvent {
    honor: string
    member: GroupMemberInfo
    action: "achieve" | "lose"
    constructor(event: object) {
        super(event);
        this.honor = event['honor']
        this.type = event['type']
        this.member = event['member']
    }
    toLog(): string {
        return `Member ${this.member.id} ${this.action} Honor ${this.honor} in Group ${this.member.group.id}`
    }
}
function GetGroupEvent(event: object) {
    switch (event['type']) {
        case 'BotGroupPermissionChangeEvent': return new BotGroupPermissionChangeEvent(event);
        case 'BotMuteEvent': return new BotMuteEvent(event);
        case 'BotUnmuteEvent': return new BotUnmuteEvent(event);
        case 'BotJoinGroupEvent': return new BotJoinGroupEvent(event);
        case 'BotLeaveEventActive': return new BotLeaveEventActive(event);
        case 'BotLeaveEventKick': return new BotLeaveEventKick(event);
        case 'GroupRecallEvent': return new GroupRecallEvent(event);
        case 'FriendRecallEvent': return new FriendRecallEvent(event);
        case 'NudgeEvent': return new NudgeEvent(event);
        case 'GroupNameChangeEvent': return new GroupNameChangeEvent(event);
        case 'GroupEntranceAnnouncementChangeEvent': return new GroupEntranceAnnouncementChangeEvent(event);
        case 'GroupMuteAllEvent': return new GroupMuteAllEvent(event);
        case 'GroupAllowAnonymousChatEvent': return new GroupAllowAnonymousChatEvent(event);
        case 'GroupAllowConfessTalkEvent': return new GroupAllowConfessTalkEvent(event);
        case 'GroupAllowMemberInviteEvent': return new GroupAllowMemberInviteEvent(event);
        case 'MemberJoinEvent': return new MemberJoinEvent(event);
        case 'MemberLeaveEventKick': return new MemberLeaveEventKick(event);
        case 'MemberLeaveEventQuit': return new MemberLeaveEventQuit(event);
        case 'MemberCardChangeEvent': return new MemberCardChangeEvent(event);
        case 'MemberSpecialTitleChangeEvent': return new MemberSpecialTitleChangeEvent(event);
        case 'MemberPermissionChangeEvent': return new MemberPermissionChangeEvent(event);
        case 'MemberMuteEvent': return new MemberMuteEvent(event);
        case 'MemberUnmuteEvent': return new MemberUnmuteEvent(event);
        case 'MemberHonorChangeEvent': return new MemberHonorChangeEvent(event);
    }
    return null;
}

export { GetGroupEvent }
export { BotGroupPermissionChangeEvent, BotMuteEvent, BotUnmuteEvent, BotJoinGroupEvent, BotLeaveEventActive, BotLeaveEventKick }
export { GroupRecallEvent, FriendRecallEvent, NudgeEvent, GroupNameChangeEvent, GroupEntranceAnnouncementChangeEvent, GroupMuteAllEvent, GroupAllowAnonymousChatEvent, GroupAllowConfessTalkEvent, GroupAllowMemberInviteEvent }
export { MemberJoinEvent, MemberLeaveEventKick, MemberLeaveEventQuit, MemberCardChangeEvent, MemberSpecialTitleChangeEvent, MemberPermissionChangeEvent, MemberMuteEvent, MemberUnmuteEvent, MemberHonorChangeEvent }