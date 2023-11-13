abstract class MessageSegment {
    public type: string
    protected data: object

    protected constructor(segment: object) {
        this.type = segment['type']
        this.data = segment
    }

    abstract toLog(): string
    abstract equals(other: MessageSegment): boolean
}

class NotImplementSegment extends MessageSegment {
    constructor(segment: object) {
        super(segment)
    }
    toLog(): string {
        return `[NotImplemented: ${JSON.stringify(this.data)}]`
    }
    equals(other: MessageSegment): boolean {
        return this.toLog() == other.toLog()
    }
}
interface EncodeAbleMessage {
    ToMiraiCode(): string
}

function escapeMirai(data: string): string {
    return data.replaceAll('[', '\\[')
        .replaceAll("]", "\\]")
        .replaceAll(":", "\\:")
        .replaceAll(",", "\\,")
        .replaceAll("\\", "\\\\");
}

type MessageChain = MessageSegment[]

export { MessageSegment, EncodeAbleMessage, escapeMirai, MessageChain }

class NodeRef {
    messageId: number
    target: number
    constructor(messageId: number, target: number) {
        this.messageId = messageId
        this.target = target
    }
}
class NodeContent {
    senderId: number
    time: number
    senderName: string
    messageChain: MessageSegment[]
    constructor(senderId: number, time: number, senderName: string, messageChain: MessageSegment[]) {
        this.senderId = senderId
        if (time.toString().length == 13) this.time = Math.floor(time / 1000)
        else this.time = time
        this.senderName = senderName
        this.messageChain = messageChain
    }
}

class ForwardMessageNode {
    senderId: number
    time: number
    senderName: string
    messageChain: MessageSegment[]
    messageId: number
    messageRef: NodeRef
    constructor(arg: NodeContent | number | NodeRef) {
        this.senderId = null
        this.time = null
        this.senderName = null
        this.messageChain = null
        this.messageId = null
        this.messageRef = null
        if (typeof arg === "number") {
            this.messageId = arg
        } else if (arg instanceof NodeRef) {
            this.messageRef = arg
        } else {
            this.senderId = arg.senderId
            this.time = arg.time
            this.senderName = arg.senderName
            this.messageChain = arg.messageChain
        }
    }
}
class ForwardMessageDisplay {
    title: string = "聊天记录"
    brief: string = "[聊天记录]"
    source: string = "聊天记录"
    preview: string[] = ["聊天记录"]
    summary: string = "查看转发消息"
}
export { NodeContent, NodeRef, ForwardMessageNode, ForwardMessageDisplay }

// class MusicKindClass {

//     appId: number
//     platform: number
//     sdkVersion: string
//     packageName: string
//     signature: string

//     constructor(appId: number, platform: number, sdkVersion: string, packageName: string, signature: string) {
//         this.appId = appId
//         this.platform = platform
//         this.sdkVersion = sdkVersion
//         this.packageName = packageName
//         this.signature = signature
//     }

// }

// namespace MusicKind {
//     let NeteaseCloudMusic = new MusicKindClass(
//         100495085,
//         1,
//         "0.0.0",
//         "com.netease.cloudmusic",
//         "da6b069da1e2982db3e386233f68d76d")
//     let QQMusic = new MusicKindClass(
//         100497308,
//         1,
//         "0.0.0",
//         "com.tencent.qqmusic",
//         "cbd27cd7c861227d013a25b2d10f0799"
//     )
//     let MiguMusic = new MusicKindClass(
//         1101053067,
//         1,
//         "0.0.0",
//         "cmccwm.mobilemusic",
//         "6cdc72a439cef99a3418d2a78aa28c73"
//     )


//     let KugouMusic = new MusicKindClass(
//         205141,
//         1,
//         "0.0.0",
//         "com.kugou.android",
//         "fe4a24d80fcf253a00676a808f62c2c6"
//     )


//     let KuwoMusic = new MusicKindClass(
//         100243533,
//         1,
//         "0.0.0",
//         "cn.kuwo.player",
//         "bf9ff4ffb4c558a34ee3fd52c223ebf5"
//     )

// }