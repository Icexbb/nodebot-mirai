import * as ws from "ws";
import { EventEmitter } from "events";

import { GetEvent } from "./events/src/construct.js";
import { Logger } from "./logger.js"
import { NodeBot } from "./bot.js";
export class MiraiHttpWsAdapter {
    host: string
    port: number
    qq: number
    verifyKey: string

    connection: ws.WebSocket
    evEmitter = new EventEmitter()
    sessionID: string
    logger: Logger

    bot: NodeBot

    url(): string {
        return `ws://${this.host}:${this.port}/all?verifyKey=${this.verifyKey}&qq=${this.qq}`
    }


    constructor(host: string, port: number, qq: number, verifyKey: string, bot: NodeBot) {
        this.host = host
        this.port = port
        this.qq = qq
        this.bot = bot
        this.verifyKey = verifyKey
        this.logger = this.bot.logger
    }
    connect() {
        return new Promise((resolve) => {
            // this.logger.info(`webSocket Connecting to ${this.url()}`)
            this.connection = new ws.WebSocket(this.url())
            this.connection.once("open", () => {
                this.initialMsgHandler()

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
                let logInfo: string
                try {
                    logInfo = miraiEvent.toLog()
                } catch (error) {
                    logInfo = JSON.stringify(miraiEvent.rawData)
                    this.logger.error("LogError:", error)
                }
                this.logger.info(`[${miraiEvent.type}] ${logInfo}`)

                this.evEmitter.emit(miraiEvent.type, miraiEvent)
            } else if (rawData.syncId === "") {
                this.sessionID = rawData.data.session
                this.logger.success(`[SessionID]: ${this.sessionID}`)
                this.bot.api.registerSessionKey(this.sessionID)
            }
        }

    }
}

