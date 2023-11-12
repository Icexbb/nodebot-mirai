import * as ws from "ws";
import { WsApiCaller } from "./api.js";
import { ConfiguredBotObject } from "./class.js";
import { Logger } from "./logger.js";
import { Service } from "./service/service.js";
import * as fs from 'node:fs';
import { EventEmitter } from "events";
import { GetEvent } from "./events/index.js";
import chalk from "chalk";

export class NodeBot extends ConfiguredBotObject {
    host: string;
    port: number;
    verifyKey: any;
    sessionID: any;
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
    // adapter: MiraiHttpWsAdapter;
    logger: Logger
    ServiceSet: { [key: string]: Service } = {};
    qq: number
    api: WsApiCaller
    connection: ws.WebSocket
    miraiEvent: EventEmitter = new EventEmitter()

    url() {
        return `ws://${this.host}:${this.port}/all?verifyKey=${this.verifyKey}&qq=${this.qq}`
    }
    connect() {
        return new Promise((resolve) => {
            this.connection = new ws.WebSocket(this.url())
            this.connection.once("open", () => {
                this.initialMsgHandler()
                resolve(null)
            })
        })
    }
    initialMsgHandler() {
        this.logger.success(`Connection | Connected to ${this.url()}`)

        this.connection.onclose = (event: ws.CloseEvent) => {
            this.logger.error(`Connection | Connection to ${this.url()} has Disconnected`)
            setTimeout(() => {
                this.logger.info(`Connection | Reconnecting to ${this.url()}`)
                this.connect()
            }, 1000);
        }
        this.connection.onmessage = async (event: ws.MessageEvent) => {
            let rawData = JSON.parse(String(event.data))
            if (rawData.syncId === "-1") {
                let miraiEvent = GetEvent(rawData.data, this)
                let logInfo: string
                try {
                    logInfo = miraiEvent.toLog()
                } catch (error) {
                    logInfo = JSON.stringify(miraiEvent.rawData)
                    this.logger.error("LogError: ", error)
                }
                this.logger.info(`${chalk.cyan(miraiEvent.type)} | ${logInfo}`)

                this.miraiEvent.emit(miraiEvent.type, miraiEvent)
            } else if (rawData.syncId === "") {
                this.sessionID = rawData.data.session
                let bot = this
                const Wait = (ms: number) => { return new Promise((resolve) => { setTimeout(resolve, ms) }) }
                let sessionRegisted = false;
                while (true) {
                    await Wait(1000)
                    try {
                        bot.api.registerSessionKey(this.sessionID)
                        sessionRegisted = true;
                    } catch (error) {
                        bot.logger.error(`SessionID | ${chalk.bold.green(this.sessionID)} register failed, retrying...`)
                    }
                    if (sessionRegisted) break;
                }
                this.logger.success(`SessionID | ${chalk.bold.green(this.sessionID)} Registered`)
            }
        }

    }

    constructor(host: string, port: number, qq: number, verifyKey: string) {
        super("bot", "bot");
        this.qq = qq
        this.host = host
        this.port = port
        this.verifyKey = verifyKey
        this.logger = new Logger(this);
        this.logger.info(`Bot | ${qq} connecting to ${host}:${port}`)
        this.connect().then(() => {
            this.api = new WsApiCaller(this)
            this.logger.registerApiCaller(this.api)
            this.miraiEvent.emit("BotConnected")
            this.loadService()
        })
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
                this.logger.success(`Service | Loaded ${chalk.bold.green(service.toUpperCase())}`)
            }, (err) => {
                this.logger.error(`Service | Load ${chalk.bold.red(service.toUpperCase())} Failed: ${err}\n`)
                console.log(err, "\n")
            })
        });
    }
    importService(service: any): Promise<void> {
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
    reloadService(service: string) {
        this.ServiceSet[service] = undefined
        this.importService(service).then(() => {
            this.logger.success(`Service | Reloaded ${chalk.bold.green(service.toUpperCase())}`)
        }, (err) => {
            this.logger.error(`Service | Reload ${chalk.bold.red(service.toUpperCase())} Failed: ${err}\n`)
            console.log(err, "\n")
        })
    }
    reloadAllService() {
        this.ServiceSet={}
        this.loadService()
    }
    registerService(name: string, service: Service) {
        this.ServiceSet[name] = service;
        this.ServiceSet[name].registerBot(this);
    }
}