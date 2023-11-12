import schedule from "node-schedule"
import chalk from "chalk";

import { NodeBot } from "../bot.js"
import { MessageEvent, FriendMessage, GroupMessage } from "../events/index.js"
import { ConfiguredBotObject, GroupPermission } from "../class.js";
import { PermissionLevel, EventPremissionSolver } from "./permission.js"
import { MessageChain, MessageSegmentTypes, NewSegment } from "../message/index.js";
import { Hash } from "../utils.js";
import { Logger } from "../logger.js";
import { EventEmitter } from "events";
import path from "path";
// import { dirname } from "node:path";
// import { fileURLToPath } from "node:url";

type TextHandlerFuncFriend = (service: Service, event: FriendMessage, matchRes: RegExpExecArray | RegExpMatchArray) => void
type TextHandlerFuncGroup = (service: Service, event: GroupMessage, matchRes: RegExpExecArray | RegExpMatchArray) => void
type TextHandlerFunc = (service: Service, event: MessageEvent, matchRes: RegExpExecArray | RegExpMatchArray) => void

type TextHandlerObjFriend = { trigger: RegExp, func: TextHandlerFuncFriend, visible: boolean, once: boolean, target: number[] }
type TextHandlerObjGroup = { trigger: RegExp, func: TextHandlerFuncGroup, visible: boolean, once: boolean, target: number[] }

type PartHandlerFuncFriend = (service: Service, event: FriendMessage) => void
type PartHandlerFuncGroup = (service: Service, event: GroupMessage) => void
type PartHandlerFunc = (service: Service, event: MessageEvent) => void

type PartHandlerObjFriend = { type: MessageSegmentTypes, func: PartHandlerFuncFriend, visible: boolean, once: boolean, target: number[] }
type PartHandlerObjGroup = { type: MessageSegmentTypes, func: PartHandlerFuncGroup, visible: boolean, once: boolean, target: number[] }

type AnyHandlerFunc = (service: Service, event: MessageEvent) => void
type AnyHandlerFuncFriend = (service: Service, event: FriendMessage) => void
type AnyHandlerFuncGroup = (service: Service, event: GroupMessage) => void

type AnyHandlerObjFriend = { func: AnyHandlerFuncFriend, visible: boolean, once: boolean, target: number[] }
type AnyHandlerObjGroup = { func: AnyHandlerFuncGroup, visible: boolean, once: boolean, target: number[] }

type ScheduledFunc = (service: Service) => void
type TimeHandlerObj = { cron: string, func: ScheduledFunc, job: schedule.Job, visible: boolean }



export abstract class Service extends ConfiguredBotObject {
    serviceConfig: { enabledDefault?: boolean }
    permissionLevel: PermissionLevel

    TextHandlerSetFriend: { [key: string]: TextHandlerObjFriend }
    TextHandlerSetGroup: { [key: string]: TextHandlerObjGroup }
    TimeHandlerSet: { [key: string]: TimeHandlerObj } = {};

    PartHandlerSetGroup: { [key: string]: PartHandlerObjGroup };
    PartHandlerSetFriend: { [key: string]: PartHandlerObjFriend };

    AnyHandlerSetGroup: { [key: string]: AnyHandlerObjGroup };
    AnyHandlerSetFriend: { [key: string]: AnyHandlerObjFriend };

    msgEventEmitter: EventEmitter
    abstract registerResponser(): void

    bot: NodeBot
    logger: Logger
    visible: boolean = true
    alias: string = ""

    protected constructor(name: string, { enabledDefault = false, permissionLevel = PermissionLevel.normal }: { enabledDefault?: boolean, permissionLevel?: PermissionLevel }) {
        super(name);
        this.name = name
        this.serviceConfig = { enabledDefault }
        this.permissionLevel = permissionLevel
        this.TextHandlerSetFriend = {}
        this.TextHandlerSetGroup = {}
        this.PartHandlerSetGroup = {}
        this.PartHandlerSetFriend = {}
        this.TimeHandlerSet = {}
    }
    serviceDir() {
        return path.resolve(process.cwd(), 'service', this.name)
    }
    reply(event: FriendMessage | GroupMessage, message: MessageChain, quote: boolean = true) {
        if (event instanceof FriendMessage) {
            this.bot.api.SendFriendMessage(message, event.sender.id, quote ? event.msgId() : null)
        } else {
            this.bot.api.SendGroupMessage(message, event.sender.group.id, event.sender.id, quote ? event.msgId() : null)
        }
    }
    serviceHelp(): string {
        const funcHelp = (f: TextHandlerObjFriend | TextHandlerObjGroup, prefix: string) => {
            if (!f.visible) return ""
            return `${prefix}${Boolean(f.func.name) ? f.func.name : "匿名方法"}:${f.trigger.toString()}`
        }
        const JobHelp = (s: TimeHandlerObj) => {
            if (!s.visible) return ""
            return `定时 ${s.func.name ?? "未命名任务"}:${s.cron}`
        }
        let service = this
        if (service.visible == false) return;
        let helpMsg = `${service.alias !== "" ? service.alias : service.name} 帮助信息: \n`
        let servHelps = []
        Object.keys(service.TextHandlerSetFriend).forEach((key) => { servHelps.push(funcHelp(service.TextHandlerSetFriend[key], "私聊")) });
        Object.keys(service.TextHandlerSetGroup).map((key) => { servHelps.push(funcHelp(service.TextHandlerSetGroup[key], "群聊")) });
        Object.keys(service.TimeHandlerSet).map((key) => { servHelps.push(JobHelp(service.TimeHandlerSet[key])) });
        (servHelps.filter((item) => item != "") ?? ["暂无"]).forEach((item) => { helpMsg += item + "\n" })
        return helpMsg.trim()
    }
    regServiceName() {
        return this.alias == "" ? this.name : `${this.name}|${this.alias}`
    }
    registerBot(bot: NodeBot) {
        this.bot = bot
        this.logger = this.bot.logger

        this.onGroupMessageText(new RegExp(`^(开启|启用|打开)(${this.regServiceName()})`), function EnableService(service, event) {
            if (event.sender.permission == GroupPermission.MEMBER) return;
            let group = event.sender.group.id
            let config = service.getConfig() as { enabled: number[], disabled: number[] }
            if (!config['enabled']) config['enabled'] = []
            if (!config['disabled']) config['disabled'] = []

            if (group in config['disabled']) config['disabled'] = config['disabled'].filter((item) => item != group)
            if (!(group in config['enabled'])) config['enabled'] = config['enabled'].concat(group)

            service.setConfig(config)
            let msg = [NewSegment.Plain(`已开启${service.name}`)]
            service.bot.api.SendGroupMessage(msg, group, group, event.msgId())
        }, false)
        this.onGroupMessageText(new RegExp(`^(关闭|禁用|停用)(${this.regServiceName()})`), function DisableService(service, event) {
            if (event.sender.permission == GroupPermission.MEMBER) return;
            let group = event.sender.group.id
            let config = service.getConfig() as { enabled: number[], disabled: number[] }
            if (!config['enabled']) config['enabled'] = []
            if (!config['disabled']) config['disabled'] = []

            if (group in config['enabled']) config['enabled'] = config['enabled'].filter((item) => item != group)
            if (!(group in config['disabled'])) config['disabled'] = config['disabled'].concat(group)

            service.setConfig(config)
            let msg = [NewSegment.Plain(`已关闭${service.name}`)]
            service.bot.api.SendGroupMessage(msg, group, group, event.msgId())
        }, false)
        this.onGroupMessageText(new RegExp(`^(帮助|[Hh][Ee][Ll][Pp])(${this.regServiceName()})`), function HelpService(service, event) {
            let helpMsg = service.serviceHelp()
            let msg = [NewSegment.Plain(helpMsg.trim())]
            service.bot.api.SendGroupMessage(msg, event.sender.group.id, event.sender.group.id, event.msgId())
        }, false)

        this.initEventEmitter()
        this.registerResponser()
    }
    private initEventEmitter() {
        this.bot.miraiEvent.on("FriendMessage", (event) => { this.msgEventEmitter.emit("FriendMessage", event) })
        this.bot.miraiEvent.on("GroupMessage", (event) => { this.msgEventEmitter.emit("GroupMessage", event) })

        this.msgEventEmitter = new EventEmitter()
        this.msgEventEmitter.on("FriendMessage", (miraiEvent) => { this.handleMsgTextFriend(miraiEvent, this) })
        this.msgEventEmitter.on("GroupMessage", (miraiEvent) => { this.handleMsgTextGroup(miraiEvent, this) })

        this.msgEventEmitter.on("GroupMessage", (miraiEvent) => { this.handleMsgPartGroup(miraiEvent, this) })
        this.msgEventEmitter.on("FriendMessage", (miraiEvent) => { this.handleMsgPartFriend(miraiEvent, this) })

        this.msgEventEmitter.on("GroupMessage", (miraiEvent) => { this.handleMsgAnyGroup(miraiEvent, this) })
        this.msgEventEmitter.on("FriendMessage", (miraiEvent) => { this.handleMsgAnyFriend(miraiEvent, this) })
    }
    private checkEnabled(event: GroupMessage | FriendMessage): boolean {
        let permissionSolver = new EventPremissionSolver(event)

        if (permissionSolver.userPermission < this.permissionLevel)
            return false
        if (event instanceof FriendMessage) {
            return true
        } else {
            let enabled: boolean = true;
            let config = this.getConfig() as { enabled: number[], disabled: number[] }
            if (!config['enabled']) config['enabled'] = []
            if (!config['disabled']) config['disabled'] = []
            if (this.serviceConfig.enabledDefault)
                enabled = !(event.sender.group.id in config['disabled'])
            else
                enabled = (event.sender.group.id in config['enabled'])

            enabled = enabled && (permissionSolver.groupPermission >= this.permissionLevel)
            return enabled
        }
    }
    private handleMsgTextFriend = (event: FriendMessage, service: Service) => {
        if (!service.checkEnabled(event)) return;

        for (let hash in service.TextHandlerSetFriend) {
            let target = service.TextHandlerSetFriend[hash].target ?? []
            if (target.length != 0 && !target.includes(event.sender.id)) continue;

            let matchRes = event.msgToString().match(service.TextHandlerSetFriend[hash].trigger)
            if (matchRes) {
                try {
                    if (service.TextHandlerSetFriend[hash].visible)
                        this.logger.success(`Message ${event.msgId()} matched /${chalk.yellow(service.TextHandlerSetFriend[hash].trigger.toString())}/`)
                    service.TextHandlerSetFriend[hash].func.bind(service)(service, event, matchRes)
                } catch (e) {
                    service.logger.error(`Error in ${service.name} FriendResposer ${service.TextHandlerSetFriend[hash].func.name}: ${e}\n${e.stack}`)
                } finally {
                    if (service.TextHandlerSetFriend[hash].once) delete service.TextHandlerSetFriend[hash]
                }
            };
        }
    }
    private handleMsgTextGroup = (event: GroupMessage, service: Service) => {
        if (!service.checkEnabled(event)) return;
        for (let hash in service.TextHandlerSetGroup) {

            let target = service.TextHandlerSetGroup[hash].target ?? []
            if (target.length != 0 && !target.includes(event.sender.group.id)) continue;
            let matchRes = event.msgToString().match(service.TextHandlerSetGroup[hash].trigger)
            if (matchRes) {
                try {
                    if (service.TextHandlerSetGroup[hash].visible)
                        this.logger.success(`Message ${event.msgId()} matched ${chalk.yellow(service.TextHandlerSetGroup[hash].trigger.toString())}`)
                    service.TextHandlerSetGroup[hash].func.bind(service)(service, event, matchRes)
                } catch (e) {
                    service.logger.error(`Error in ${service.name} GroupResposer ${service.TextHandlerSetGroup[hash].func.name}: ${e}\n${e.stack}`)
                } finally {
                    if (service.TextHandlerSetGroup[hash].once) delete service.TextHandlerSetGroup[hash]
                }
            }

        }
    }
    private handleMsgPartGroup = (event: GroupMessage, service: Service) => {
        if (!service.checkEnabled(event)) return;
        for (let hash in service.PartHandlerSetGroup) {
            let target = service.PartHandlerSetGroup[hash].target ?? []
            let partType = service.PartHandlerSetGroup[hash].type
            if (target.length != 0 && !target.includes(event.sender.group.id)) continue;
            if (event.messageChain.filter((seg) => seg.type == partType).length === 0) continue;

            try {
                if (service.PartHandlerSetGroup[partType][hash].visible)
                    this.logger.success(`Message ${event.msgId()} matched ${chalk.yellow(partType)}`)
                service.PartHandlerSetGroup[partType][hash].func.bind(service)(service, event)
            } catch (e) {
                service.logger.error(`Error in ${service.name} ${partType} Resposer ${service.PartHandlerSetGroup[partType][hash].func.name}: ${e}\n${e.stack}`)
            } finally {
                if (service.PartHandlerSetGroup[partType][hash].once) delete service.PartHandlerSetGroup[partType][hash]
            }
        }
    }
    private handleMsgPartFriend = (event: FriendMessage, service: Service) => {
        if (!service.checkEnabled(event)) return;

        for (let hash in service.PartHandlerSetFriend) {
            let target = service.PartHandlerSetFriend[hash].target ?? []
            if (target.length != 0 && !target.includes(event.sender.id)) continue;
            let partType = service.PartHandlerSetFriend[hash].type
            if (event.messageChain.filter((seg) => seg.type == partType).length === 0) continue;

            try {
                if (service.PartHandlerSetFriend[partType][hash].visible)
                    this.logger.success(`Message ${event.msgId()} matched ${chalk.yellow(partType)}`)
                service.PartHandlerSetFriend[partType][hash].func.bind(service)(service, event)
            } catch (e) {
                service.logger.error(`Error in ${service.name} ${partType} Resposer ${service.PartHandlerSetFriend[partType][hash].func.name}: ${e}\n${e.stack}`)
            } finally {
                if (service.PartHandlerSetFriend[partType][hash].once) delete service.PartHandlerSetFriend[partType][hash]
            }
        }
    }
    private handleMsgAnyGroup = (event: GroupMessage, service: Service) => {
        if (!service.checkEnabled(event)) return;
        for (let hash in service.AnyHandlerSetGroup) {
            let target = service.AnyHandlerSetGroup[hash].target ?? []
            if (target.length != 0 && !target.includes(event.sender.group.id)) continue;

            try {
                if (service.AnyHandlerSetGroup[hash].visible)
                    this.logger.success(`Message ${event.msgId()} matched AnyHandler`)
                service.AnyHandlerSetGroup[hash].func.bind(service)(service, event)
            } catch (e) {
                service.logger.error(`Error in ${service.name} AnyHandler ${service.AnyHandlerSetGroup[hash].func.name}\n${e.stack}`)
            } finally {
                if (service.AnyHandlerSetGroup[hash].once) delete service.AnyHandlerSetGroup[hash]
            }
        }
    }
    private handleMsgAnyFriend = (event: FriendMessage, service: Service) => {
        if (!service.checkEnabled(event)) return;
        for (let hash in service.AnyHandlerSetFriend) {
            let target = service.AnyHandlerSetFriend[hash].target ?? []
            if (target.length != 0 && !target.includes(event.sender.id)) continue;

            try {
                if (service.AnyHandlerSetFriend[hash].visible)
                    this.logger.success(`Message ${event.msgId()} matched AnyHandler`)
                service.AnyHandlerSetFriend[hash].func.bind(service)(service, event)
            } catch (e) {
                service.logger.error(`Error in ${service.name} AnyHandler ${service.AnyHandlerSetFriend[hash].func.name}: ${e}\n${e.stack}`)
            } finally {
                if (service.AnyHandlerSetFriend[hash].once) delete service.AnyHandlerSetFriend[hash]
            }
        }
    }

    onFriendMessageText(
        trigger: RegExp, func: TextHandlerFuncFriend,
        visible: boolean = true, target: number[] = [], once: boolean = false
    ) {
        if (this.TextHandlerSetFriend === undefined || this.TextHandlerSetFriend === null) {
            this.TextHandlerSetFriend = {}
        }
        let pair = { trigger, func, visible, target, once }
        let hash = Hash(...Object.values(pair), Date.now().toString(), Object.keys(this.TextHandlerSetFriend))
        this.TextHandlerSetFriend[hash] = pair
    }
    onGroupMessageText(
        trigger: RegExp, func: TextHandlerFuncGroup,
        visible: boolean = true, target: number[] = [], once: boolean = false
    ) {
        if (this.TextHandlerSetGroup === undefined || this.TextHandlerSetGroup === null) {
            this.TextHandlerSetGroup = {}
        }
        let pair = { trigger, func, visible, target, once }
        let hash = Hash(...Object.values(pair), Date.now().toString(), Object.keys(this.TextHandlerSetGroup))
        this.TextHandlerSetGroup[hash] = pair
    }
    onMessageText(
        trigger: RegExp, func: TextHandlerFunc,
        visible: boolean = true, target: number[] = []
    ) {
        this.onFriendMessageText(trigger, func, visible, target)
        this.onGroupMessageText(trigger, func, visible, target)
    }

    onFriendMessagePart(
        type: MessageSegmentTypes, func: PartHandlerFuncFriend,
        visible: boolean = true, target: number[] = [], once: boolean = false
    ) {
        if (this.PartHandlerSetFriend === undefined || this.PartHandlerSetFriend === null) {
            this.PartHandlerSetFriend = {}
        }
        let pair = { type, func, visible, target, once }
        let hash = Hash(...Object.values(pair), Date.now().toString(), Object.keys(this.PartHandlerSetFriend))
        this.PartHandlerSetFriend[hash] = pair
    }
    onGroupMessagePart(
        type: MessageSegmentTypes, func: PartHandlerFuncGroup,
        visible: boolean = true, target: number[] = [], once: boolean = false
    ) {
        if (this.PartHandlerSetGroup === undefined || this.PartHandlerSetGroup === null) {
            this.PartHandlerSetGroup = {}
        }
        let pair = { type, func, visible, target, once }
        let hash = Hash(...Object.values(pair), Date.now().toString(), Object.keys(this.PartHandlerSetGroup))
        this.PartHandlerSetGroup[hash] = pair
    }
    onMessagePart(
        type: MessageSegmentTypes, func: PartHandlerFunc,
        visible: boolean = true, target: number[] = []
    ) {
        this.onFriendMessagePart(type, func, visible, target)
        this.onGroupMessagePart(type, func, visible, target)
    }

    onAnyFriendMessage(
        func: AnyHandlerFuncFriend,
        visible: boolean = true, target: number[] = [], once: boolean = false
    ) {
        if (this.AnyHandlerSetFriend === undefined || this.AnyHandlerSetFriend === null) {
            this.AnyHandlerSetFriend = {}
        }
        let pair = { func, visible, target, once }
        let hash = Hash(...Object.values(pair), Date.now().toString(), Object.keys(this.AnyHandlerSetFriend))
        this.AnyHandlerSetFriend[hash] = pair
    }
    onAnyGroupMessage(
        func: AnyHandlerFuncGroup,
        visible: boolean = true, target: number[] = [], once: boolean = false
    ) {
        if (this.AnyHandlerSetGroup === undefined || this.AnyHandlerSetGroup === null) {
            this.AnyHandlerSetGroup = {}
        }
        let pair = { func, visible, target, once }
        let hash = Hash(...Object.values(pair), Date.now().toString(), Object.keys(this.AnyHandlerSetGroup))
        this.AnyHandlerSetGroup[hash] = pair
    }
    onAnyMessage(
        func: AnyHandlerFunc,
        visible: boolean = true, target: number[] = []
    ) {
        this.onAnyFriendMessage(func, visible, target)
        this.onAnyGroupMessage(func, visible, target)
    }

    onScheduled(cron: string, func: (service: Service) => void, visible: boolean = true) {
        let job = schedule.scheduleJob(cron, () => { func(this) })
        let hash = Hash(cron, func.toString(), job.name)
        this.TimeHandlerSet[hash] = { cron, func, job, visible }
    }
}