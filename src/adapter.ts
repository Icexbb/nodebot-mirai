import * as ws from "ws";
import { EventEmitter } from "events";

import { GetEvent } from "./events/src/construct.js";
import { WsApiCaller } from "./api.js";
import { Logger, logger } from "./logger.js"
import { NodeBot } from "./bot.js";
export class MiraiHttpWsAdapter {
    host: string
    port: number
    qq: number
    verifyKey: string

    connection: ws.WebSocket
    evEmitter = new EventEmitter()
    sessionID: string
    api: WsApiCaller
    logger: Logger = logger

    bot: NodeBot

    url(): string {
        return `ws://${this.host}:${this.port}/all?verifyKey=${this.verifyKey}&qq=${this.qq}`
    }


    constructor(host: string, port: number, qq: number, verifyKey: string, bot: NodeBot) {
        this.host = host
        this.port = port
        this.qq = qq
        this.verifyKey = verifyKey
        this.bot = bot
    }
    connect() {
        return new Promise((resolve) => {
            // this.logger.info(`webSocket Connecting to ${this.url()}`)
            this.connection = new ws.WebSocket(this.url())
            this.connection.once("open", () => {
                this.initialMsgHandler()
                this.api = new WsApiCaller(this.connection, this.qq)
                this.logger.registerApiCaller(this.api)
                resolve(null)
            })
        })
    }

    initialMsgHandler() {
        this.logger.success(`webSocket Connected to ${this.url()}`)

        this.connection.onclose = (event: ws.CloseEvent) => {
            this.logger.error(`webSocket to ${this.url()} has Disconnected`)
            setTimeout(() => {
                this.logger.info(`webSocket Reconnecting to ${this.url()}`)
                this.connect()
            }, 1000);
        }
        this.connection.onmessage = (event: ws.MessageEvent) => {
            let rawData = JSON.parse(String(event.data))
            if (rawData.syncId === "-1") {
                let miraiEvent = GetEvent(rawData.data, this.bot)
                this.evEmitter.emit(miraiEvent.type, miraiEvent)
                let logInfo: string
                try {
                    logInfo = miraiEvent.toLog()
                } catch (error) {
                    logInfo = JSON.stringify(miraiEvent.rawData)
                    this.logger.error("LogError:", error)
                }
                this.logger.info(`[${miraiEvent.type}] ${logInfo}`)
            } else if (rawData.syncId === "") {
                this.sessionID = rawData.data.session
                this.logger.success(`[SessionID]: ${this.sessionID}`)
                this.api.registerSessionKey(this.sessionID)
            }
        }

    }
}

