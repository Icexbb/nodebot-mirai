import * as ws from "ws";
import {GetEvent} from "./events/event.js";
import * as events from "events";

class MiraiHttpWsAdapter {
    host: string
    port: number
    qq: number
    verifyKey: string

    connection: ws.WebSocket
    handler: wsHandler

    url(): string {
        return `ws://${this.host}:${this.port}/all?verifyKey=${this.verifyKey}&qq=${this.qq}`
    }

    constructor(host: string, port: number, qq: number, verifyKey: string) {
        this.host = host
        this.port = port
        this.qq = qq
        this.verifyKey = verifyKey
        this.connection = new ws.WebSocket(this.url())
    }

    register(handler: wsHandler) {
        this.handler = handler
        this.connection.onopen = (ev) => {
            this.handler.onopen(this, ev)
        }
        this.connection.onmessage = (ev) => {
            this.handler.onmessage(this, ev)
        }
        this.connection.onclose = (ev) => {
            this.handler.onclose(this, ev)
        }
        this.connection.onerror = (ev) => {
            this.handler.onerror(this, ev)
        }
    }

    unregister() {
        this.handler = null
        this.connection.onopen = () => {
        }
        this.connection.onmessage = () => {
        }
        this.connection.onclose = () => {
        }
        this.connection.onerror = () => {
        }
    }
}

interface wsHandler {
    onopen: (adapter: MiraiHttpWsAdapter, event: ws.Event) => void
    onmessage: (adapter: MiraiHttpWsAdapter, event: ws.MessageEvent) => void
    onclose: (adapter: MiraiHttpWsAdapter, event: ws.CloseEvent) => void
    onerror: (adapter: MiraiHttpWsAdapter, event: ws.ErrorEvent) => void
}

class MiraiMessageHandler implements wsHandler {
    evEmitter = new events.EventEmitter()
    onopen(adapter: MiraiHttpWsAdapter, event: ws.Event) {
        console.log(`webSocket Connected to ${adapter.url()}`)
    }

    onclose(adapter: MiraiHttpWsAdapter, event: ws.CloseEvent) {
        console.log(`webSocket to ${adapter.url()} has Disconnected`)
    }

    onerror(adapter: MiraiHttpWsAdapter, event: ws.ErrorEvent) {

    }

    onmessage(adapter: MiraiHttpWsAdapter, event: ws.MessageEvent) {
        let ev = GetEvent(JSON.parse(String(event.data)))
        this.evEmitter.emit(ev.type,ev)
    }
    on(channel:string,listener: (...args: any[]) => void){
        this.evEmitter.on(channel,listener)
    }
}