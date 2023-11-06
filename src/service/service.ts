import schedule from "node-schedule"

import { NodeBot } from "../bot.js"
import { FriendInfo, GroupMemberInfo, GroupPermission } from "../class.js";
import { MessageEvent, FriendMessage, GroupMessage } from "../events/index.js"
import { ConfiguredBotObject } from "../class.js";
import { PermissionLevel, EventPremissionSolver } from "./permission.js"
import { NewSegment } from "../message/index.js";
import { Hash } from "../utils.js";
import { Logger } from "../logger.js";

type FriendResposerFunc = (service: Service, event: FriendMessage, matchRes: RegExpExecArray | RegExpMatchArray) => void
type GroupResposerFunc = (service: Service, event: GroupMessage, matchRes: RegExpExecArray | RegExpMatchArray) => void

type FriendResposer = { trigger: RegExp, func: FriendResposerFunc, visible: boolean }
type GroupResposer = { trigger: RegExp, func: GroupResposerFunc, visible: boolean }
type ScheduledFunction = { cron: string, func: (service: Service) => void, job: schedule.Job, visible: boolean }

export abstract class Service extends ConfiguredBotObject {
    permissionLevel: PermissionLevel = PermissionLevel.normal
    FriendResposers: { [key: string]: FriendResposer }
    GroupResposers: { [key: string]: GroupResposer }
    ScheduledFunctions: { [key: string]: ScheduledFunction } = {};
    bot: NodeBot
    serviceConfig: { enabledDefault?: boolean }
    abstract registerResponser(): void
    logger: Logger
    visible: boolean = true
    alias: string = ""

    protected constructor(name: string, { enabledDefault = false }: { enabledDefault?: boolean }) {
        super(name);
        this.name = name
        this.serviceConfig = { enabledDefault }
        this.FriendResposers = {}
        this.GroupResposers = {}
    }
    serviceHelp(): string {
        const funcHelp = (f: FriendResposer | GroupResposer, prefix: string) => {
            if (!f.visible) return ""
            return `${prefix}${Boolean(f.func.name) ? f.func.name : "匿名方法"}:${f.trigger.toString()}`
        }
        const JobHelp = (s: ScheduledFunction) => {
            if (!s.visible) return ""
            return `定时 ${s.func.name ?? "未命名任务"}:${s.cron}`
        }
        let service = this
        if (service.visible == false) return;
        let helpMsg = `${service.alias !== "" ? service.alias : service.name} 帮助信息: \n`
        let servHelps = []
        Object.keys(service.FriendResposers).forEach((key) => { servHelps.push(funcHelp(service.FriendResposers[key], "私聊")) });
        Object.keys(service.GroupResposers).map((key) => { servHelps.push(funcHelp(service.GroupResposers[key], "群聊")) });
        Object.keys(service.ScheduledFunctions).map((key) => { servHelps.push(JobHelp(service.ScheduledFunctions[key])) });
        (servHelps.filter((item) => item != "") ?? ["暂无"]).forEach((item) => { helpMsg += item + "\n" })
        return helpMsg.trim()
    }
    regServiceName() {
        return this.alias == "" ? this.name : `${this.name}|${this.alias}`
    }
    registerBot(bot: NodeBot) {
        this.bot = bot
        this.logger = this.bot.logger

        this.onGroupMessage(new RegExp(`^(开启|启用|打开)(${this.regServiceName()})`), function EnableService(service, event) {
            if (event.sender.permission == GroupPermission.MEMBER) return;
            let group = event.sender.group.id
            let config = service.getConfig() as { enabled: number[], disabled: number[] }
            if (!config['enabled']) config['enabled'] = []
            if (!config['disabled']) config['disabled'] = []

            if (group in config['disabled']) config['disabled'] = config['disabled'].filter((item) => item != group)
            if (!(group in config['enabled'])) config['enabled'] = config['enabled'].concat(group)

            service.setConfig(config)
            let msg = [NewSegment.Plain(`已开启${service.name}`)]
            service.bot.adapter.api.SendGroupMessage(msg, group, group, event.msgId())
        }, false)
        this.onGroupMessage(new RegExp(`^(关闭|禁用|停用)(${this.regServiceName()})`), function DisableService(service, event) {
            if (event.sender.permission == GroupPermission.MEMBER) return;
            let group = event.sender.group.id
            let config = service.getConfig() as { enabled: number[], disabled: number[] }
            if (!config['enabled']) config['enabled'] = []
            if (!config['disabled']) config['disabled'] = []

            if (group in config['enabled']) config['enabled'] = config['enabled'].filter((item) => item != group)
            if (!(group in config['disabled'])) config['disabled'] = config['disabled'].concat(group)

            service.setConfig(config)
            let msg = [NewSegment.Plain(`已关闭${service.name}`)]
            service.bot.adapter.api.SendGroupMessage(msg, group, group, event.msgId())
        }, false)
        this.onGroupMessage(new RegExp(`^(帮助|[Hh][Ee][Ll][Pp])(${this.regServiceName()})`), function HelpService(service, event) {
            let helpMsg = service.serviceHelp()
            let msg = [NewSegment.Plain(helpMsg.trim())]
            service.bot.adapter.api.SendGroupMessage(msg, event.sender.group.id, event.sender.group.id, event.msgId())
        }, false)
        this.registerResponser()

        this.bot.adapter.evEmitter.on("FriendMessage", (miraiEvent) => { this.handleFriendMessage(this, miraiEvent) })
        this.bot.adapter.evEmitter.on("GroupMessage", (miraiEvent) => { this.handleGroupMessage(this, miraiEvent) })
    }
    private checkEnabled(senderInfo: FriendInfo | GroupMemberInfo): boolean {
        if (senderInfo instanceof FriendInfo) {
            return true
        } else {
            let config = this.getConfig() as { enabled: number[], disabled: number[] }
            if (!config['enabled']) config['enabled'] = []
            if (!config['disabled']) config['disabled'] = []
            if (this.serviceConfig.enabledDefault)
                return !(senderInfo.group.id in config['disabled'])
            else
                return (senderInfo.group.id in config['enabled'])
        }
    }

    private handleFriendMessage = (service: Service, event: FriendMessage) => {
        if (!service.checkEnabled(event.sender)) return;
        let permissionSolver = new EventPremissionSolver(event)
        if (permissionSolver.userPermission < service.permissionLevel) return;
        for (let hash in service.FriendResposers) {
            let matchRes = event.msgToString().match(service.FriendResposers[hash].trigger)
            if (matchRes !== null)
                try {
                    service.FriendResposers[hash].func(service, event, matchRes)
                } catch (e) {
                    service.logger.error(`Error in ${service.name} FriendResposer ${service.FriendResposers[hash].func.name}: ${e}`)
                }
        }
    }
    private handleGroupMessage = (service: Service, event: GroupMessage) => {
        if (!service.checkEnabled(event.sender)) return;
        let permissionSolver = new EventPremissionSolver(event)
        if (permissionSolver.groupPermission < service.permissionLevel) return;
        if (permissionSolver.userPermission < service.permissionLevel) return;

        for (let hash in service.GroupResposers) {
            let matchRes = event.msgToString().match(service.GroupResposers[hash].trigger)
            if (matchRes !== null)
                try {
                    service.GroupResposers[hash].func(service, event, matchRes)
                } catch (e) {
                    service.logger.error(`Error in ${service.name} GroupResposer ${service.GroupResposers[hash].func.name}: ${e}`)
                }
        }
    }

    onFriendMessage(trigger: RegExp, func: (service: Service, event: FriendMessage, matchRes: RegExpExecArray) => void, visible: boolean = true,) {
        let f = this.FriendResposers
        let pair = { trigger, func, visible }
        let hash = Hash(trigger.toString(), func.toString(), visible.toString())
        f[hash] = pair
        this.FriendResposers = f
    }
    onGroupMessage(trigger: RegExp, func: (service: Service, event: GroupMessage, matchRes: RegExpExecArray) => void, visible: boolean = true) {
        let g = this.GroupResposers
        let pair = { trigger, func, visible }
        let hash = Hash(trigger.toString(), func.toString(), visible.toString())
        g[hash] = pair
        this.GroupResposers = g
    }
    onMessage(trigger: RegExp, func: (service: Service, event: MessageEvent, matchRes: RegExpExecArray) => void) {
        this.onFriendMessage(trigger, func)
        this.onGroupMessage(trigger, func)
    }
    onScheduled(cron: string, func: (service: Service) => void, visible: boolean = true) {
        let job = schedule.scheduleJob(cron, () => { func(this) })
        let hash = Hash(cron, func.toString(), job.name)
        this.ScheduledFunctions[hash] = { cron, func, job, visible }
    }
}