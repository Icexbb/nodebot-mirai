import * as ws from "ws";
import { GetEvent } from "./event.js";
import * as events from "events";
import { WsApiCaller } from "./api.js";
export class MiraiHttpWsAdapter {
    host: string
    port: number
    qq: number
    verifyKey: string

    connection: ws.WebSocket
    evEmitter = new events.EventEmitter()
    sessionID: string
    api: WsApiCaller

    url(): string {
        return `ws://${this.host}:${this.port}/all?verifyKey=${this.verifyKey}&qq=${this.qq}`
    }

    constructor(host: string, port: number, qq: number, verifyKey: string) {
        this.host = host
        this.port = port
        this.qq = qq
        this.verifyKey = verifyKey
    }

    connect() {
        console.log(`webSocket Connecting to ${this.url()}`)
        this.connection = new ws.WebSocket(this.url())
        this.connection.once("open", () => {
            this.initialMsgHandler()
            this.api = new WsApiCaller(this.connection, this.qq)
        })
    }

    initialMsgHandler() {
        console.log(`webSocket Connected to ${this.url()}`)

        this.connection.onclose = (event: ws.CloseEvent) => {
            console.log(`webSocket to ${this.url()} has Disconnected`)
        }
        this.connection.onerror = (event: ws.ErrorEvent) => {

        }
        this.connection.onmessage = (event: ws.MessageEvent) => {
            let rawData = JSON.parse(String(event.data))
            console.log(rawData)
            if (rawData.syncId === "-1") {
                let miraiEvent = GetEvent(rawData.data)
                this.evEmitter.emit(miraiEvent.type, miraiEvent)
                console.log(`MiraiEvent[${miraiEvent.type}]`, miraiEvent)
            } else if (rawData.syncId === "") {
                this.sessionID = rawData.data.session
                console.log(`Get SessionID: ${this.sessionID}`)
                this.api.registerSessionKey(this.sessionID)

            }
        }
    }
}

