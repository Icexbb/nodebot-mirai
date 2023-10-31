import * as ws from "ws";
import { GetEvent } from "./events/event.js";
import * as events from "events";
class MiraiHttpWsAdapter {
    host: string
    port: number
    qq: number
    verifyKey: string

    connection: ws.WebSocket
    evEmitter = new events.EventEmitter()

    url(): string {
        return `ws://${this.host}:${this.port}/all?verifyKey=${this.verifyKey}&qq=${this.qq}`
    }

    constructor(host: string, port: number, qq: number, verifyKey: string) {
        this.host = host
        this.port = port
        this.qq = qq
        this.verifyKey = verifyKey
        this.connection = new ws.WebSocket(this.url())
        this.connection.once("open", () => {
            this.initialMsgHandler()
        })
    }

    initialMsgHandler() {
        this.connection.once("open", () => {
            console.log(`webSocket Connected to ${this.url()}`)
        })
        this.connection.onclose = (event: ws.CloseEvent) => {
            console.log(`webSocket to ${this.url()} has Disconnected`)
        }
        this.connection.onerror = (event: ws.ErrorEvent) => {

        }
        this.connection.onmessage = (event: ws.MessageEvent) => {
            let ev = GetEvent(JSON.parse(String(event.data)))
            this.evEmitter.emit(ev.type, ev)
        }
    }

}

