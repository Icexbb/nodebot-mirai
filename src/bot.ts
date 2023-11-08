import { MiraiHttpWsAdapter } from "./adapter.js";
import { ConfiguredBotObject } from "./class.js";
import { Logger, logger } from "./logger.js";
import { Service } from "./service/service.js";
import fs from "fs";

export class NodeBot extends ConfiguredBotObject {
    static GetBot(id?: number | string) {
        if (global.bot === undefined || Object.keys(global.bot).length == 0) return undefined
        if (id === undefined) {
            if (Object.keys(global.bot).length == 1) return global.bot[Object.keys(global.bot)[0]]
            else throw new Error("Bot id not specified")
        } else {
            if (global.bot[id.toString()] === undefined) throw new Error(`Bot ${id} not found`)
            return global.bot[id.toString()]
        }
    }
    adapter: MiraiHttpWsAdapter;
    logger: Logger = logger;
    ServiceSet: { [key: string]: Service } = {};
    qq: number

    constructor(host: string, port: number, qq: number, verifyKey: string) {
        super("bot", "bot");
        this.logger?.info(`Bot ${qq} connecting to ${host}:${port}`)
        this.qq = qq
        this.adapter = new MiraiHttpWsAdapter(host, port, qq, verifyKey, this);
        this.adapter.connect().then(() => {
            this.adapter.evEmitter.emit("BotConnected")
            this.loadService()
        });
        this.registerGlobalBot()
    }
    registerGlobalBot() {
        if (global.bot === undefined) global.bot = {} as { [key: string]: NodeBot }
        if (global.bot[this.qq.toString()] === undefined) global.bot[this.qq.toString()] = this
    }
    loadService() {
        let config = this.getConfig()
        if (!config['services']) config['services'] = []
        config['services'].forEach((service: string) => {
            this.importService(service).then(() => {
                this.logger.success(`Service ${service} loaded`)
            }, (err) => {
                this.logger.error(`Service ${service} load failed: ${err}`)
            })
        });
    }
    async importService(service: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ServiceSet[service]) reject(`Service ${service} already loaded`)
            let path = `${process.cwd()}/service/${service}/index.js`
            if (!fs.existsSync(path)) path = `${process.cwd()}/service/${service}.js`
            if (!fs.existsSync(path)) reject(`Service ${service} Source not found`)

            import("file:///" + path).then((module) => {
                if (module.default instanceof Service) {
                    this.registerService(service, module.default)
                    resolve()
                } else reject(`Service ${service} is not a Service`)
            }).catch((err) => { reject(err) })
        })
    }
    registerService(name: string, service: Service) {
        this.ServiceSet[name] = service;
        this.ServiceSet[name].registerBot(this);
    }
}