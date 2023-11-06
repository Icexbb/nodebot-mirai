import * as Segments from "./segment.js";
import { ForwardMessageDisplay, MessageChain, MessageSegment, NodeContent, NodeRef } from "./base.js"
import fs from "fs"

export function GetMessage(data: object[]): MessageChain {
    let result = [] as MessageChain
    data.forEach((value) => {
        switch (value['type']) {
            case "Source": result.push(new Segments.Source(value)); break;
            case "Poke": result.push(new Segments.Poke(value)); break;
            case "Forward": result.push(new Segments.Forward(value)); break;
            case "Face": result.push(new Segments.Face(value)); break;
            case "FlashImage": result.push(new Segments.FlashImage(value)); break;
            case "Quote": result.push(new Segments.Quote(value)); break;
            case "File": result.push(new Segments.File(value)); break;
            case "At": result.push(new Segments.At(value)); break;
            case "Xml": result.push(new Segments.Xml(value)); break;
            case "MarketFace": result.push(new Segments.MarketFace(value)); break;
            case "App": result.push(new Segments.App(value)); break;
            case "Plain": result.push(new Segments.Plain(value)); break;
            case "MiraiCode": result.push(new Segments.MiraiCode(value)); break;
            case "Voice": result.push(new Segments.Voice(value)); break;
            case "Image": result.push(new Segments.Image(value)); break;
            case "Dice": result.push(new Segments.Dice(value)); break;
            case "Json": result.push(new Segments.Json(value)); break;
            case "AtAll": result.push(new Segments.AtAll(value)); break;
            case "MusicShare": result.push(new Segments.MusicShare(value)); break;
            default: result.push(value as MessageSegment)
        }
    })
    return result
}
import { ForwardMessageNode } from "./base.js";
export abstract class NewSegment {
    static Plain(text: string) { return new Segments.Plain({ type: "Plain", text }) }
    static Dice(value: number) { return new Segments.Dice({ type: "Dice", value }) }
    static AtAll() { return new Segments.AtAll({ type: "AtAll" }) }
    static At(target: number) { return new Segments.At({ type: "At", target: target }) }
    static MiraiCode(code: string) { return new Segments.MiraiCode({ type: "MiraiCode", code }) }
    static FNode(arg: number | NodeContent | NodeRef): ForwardMessageNode { return new ForwardMessageNode(arg) }
    static FNodeFromContent(senderId: number, time: number, senderName: string, msg: MessageChain): ForwardMessageNode { return new ForwardMessageNode(new NodeContent(senderId, time, senderName, msg)) }
    static FContent(senderId: number, time: number, senderName: string, msg: MessageChain): NodeContent { return new NodeContent(senderId, time, senderName, msg) }
    static Forward(nodeList: ForwardMessageNode[], display?: ForwardMessageDisplay) {
        return new Segments.Forward({ type: "Forward", display, nodeList })
    }

    static Face(arg: number | string) {
        switch (typeof arg) {
            case "number": return new Segments.Face({ type: "Face", faceId: arg })
            case "string": return new Segments.Face({ type: "Face", name: arg })
        }
    }

    static Image({ imageId = null, url = null, path = null, base64 = null }: { imageId?: string, url?: string, path?: string, base64?: string } = {}) {
        if (!imageId && !url && !path && !base64)
            throw new Error("Image segment must have at least one of imageId, url, path, base64")
        if (path && !base64 && fs.existsSync(path)) {
            base64 = fs.readFileSync(path).toString("base64")
        }
        if (base64) { imageId = null; url = null; path = null; }
        return new Segments.Image({ type: "Image", imageId, url, path, base64 })
    }
    static Voice({ voiceId = null, url = null, path = null, base64 = null }: { voiceId?: string, url?: string, path?: string, base64?: string } = {}) {
        if (!voiceId && !url && !path && !base64)
            throw new Error("Voice segment must have at least one of voiceId, url, path, base64")
        if (path && !base64 && fs.existsSync(path)) {
            base64 = fs.readFileSync(path).toString("base64")
        }
        if (base64) { voiceId = null; url = null; path = null; }
        return new Segments.Image({ type: "Voice", voiceId, url, path, base64 })
    }
    static MusicShare(
        kind: string, title: string, summary: string, jumpUrl: string,
        pictureUrl: string, musicUrl: string, brief: string) {
        return new Segments.MusicShare({ type: "MusicShare", kind, title, summary, jumpUrl, pictureUrl, musicUrl, brief })
    }
    static Xml(xml: string = null) { return new Segments.Xml({ type: "Xml", xml }) }
    static Json(json: string | object = null) {
        if (typeof json == "object") json = JSON.stringify(json)
        return new Segments.Json({ type: "Json", json })
    }

    // static File() { return new Segments.File({ type: "File" }) }
    // static Poke() { return new Segments.Poke({ type: "Poke" }) }
    // static App() { return new Segments.App({ type: "App" }) }
    // static Quote(id: number, groupId:number, senderId:number, targetId:number,origin:MessageChain) { return new Segments.Quote({ type: "Quote", id, groupId, senderId, targetId,origin }) }
    // static FlashImage() { return new Segments.FlashImage({ type: "FlashImage" }) }
    // static MarketFace() { return new Segments.MarketFace({ type: "MarketFace" }) }
}