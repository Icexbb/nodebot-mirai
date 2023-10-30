abstract class MessageSegment {
    public type: string

    protected constructor(segment: object) {
        this.type = segment['type']
    }

    abstract ToLog(): string
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

class Source extends MessageSegment {
    id: number
    time: number

    constructor(segment: object) {
        super(segment);
        this.id = segment['id']
        this.time = segment['time']
    }

    ToLog(): string {
        return "";
    }
}

class Quote extends MessageSegment {
    id: number
    groupId: number
    senderId: number
    targetId: number
    origin: MessageChain

    constructor(segment: object) {
        super(segment);
        this.id = segment['id']
        this.groupId = segment['groupId']
        this.senderId = segment['senderId']
        this.targetId = segment['targetId']
        this.origin = segment['origin']
    }

    ToLog(): string {
        return `>`;
    }
}

class At extends MessageSegment implements EncodeAbleMessage {
    target: number
    display: string

    constructor(segment: object) {
        super(segment);
        this.target = segment['target']
        this.display = segment['display']
    }

    ToMiraiCode(): string {
        return `[mirai:at:${this.target}]`
    }

    ToLog(): string {
        return `${this.display}(${this.target})`;
    }
}

class AtAll extends MessageSegment implements EncodeAbleMessage {
    constructor(segment: object) {
        super(segment);
    }

    ToMiraiCode(): string {
        return `[mirai:atall]`
    }

    ToLog(): string {
        return `@全体成员`;
    }
}

class Face extends MessageSegment implements EncodeAbleMessage {
    faceId: number
    name: string

    constructor(segment: object) {
        super(segment);
        this.faceId = segment['faceId']
        this.name = segment['name']
    }

    ToMiraiCode(): string {
        return `[mirai:face:${this.faceId}]`
    }

    ToLog(): string {
        return `[表情:${this.name}]`;
    }

}

class Plain extends MessageSegment implements EncodeAbleMessage {
    text: string

    constructor(segment: object) {
        super(segment);
        this.text = segment['text']
    }

    ToMiraiCode(): string {
        return this.text;
    }

    ToLog(): string {
        return this.text;
    }
}

class Image extends MessageSegment implements EncodeAbleMessage {
    imageId: string
    url: string
    path: string
    base64: string

    constructor(segment: object) {
        super(segment);
        this.imageId = segment['imageId']
        this.url = segment['url']
        this.path = segment['path']
        this.base64 = segment['base64']
    }

    ToMiraiCode(): string {
        return `[mirai:image:${escapeMirai(this.imageId)}]`;
    }

    ToLog(): string {
        return `[图片:${this.url}]`;
    }

}

class FlashImage extends MessageSegment implements EncodeAbleMessage {
    imageId: string
    url: string
    path: string
    base64: string

    constructor(segment: object) {
        super(segment);
        this.imageId = segment['imageId']
        this.url = segment['url']
        this.path = segment['path']
        this.base64 = segment['base64']
    }

    ToMiraiCode(): string {
        return `[mirai:flash:${escapeMirai(this.imageId)}]`
    }

    ToLog(): string {
        return `[闪照:${this.url}]`;
    }
}

class Voice extends MessageSegment {
    voiceId: string
    url: string
    path: string
    base64: string
    length: number

    constructor(segment: object) {
        super(segment);
        this.voiceId = segment['voiceId']
        this.url = segment['url']
        this.path = segment['path']
        this.base64 = segment['base64']
        this.length = segment['length']
    }

    ToLog(): string {
        return `[语音:${this.url}]`;
    }
}

class Xml extends MessageSegment {
    xml: string

    constructor(segment: object) {
        super(segment);
        this.xml = segment['xml']
    }

    ToLog(): string {
        return `[XML]`;
    }//TODO
}

class Json extends MessageSegment {
    json: string

    constructor(segment: object) {
        super(segment);
        this.json = segment['json']
    }

    ToLog(): string {
        return `[JSON]`;
    }
}

class App extends MessageSegment implements EncodeAbleMessage {
    content: string

    constructor(segment: object) {
        super(segment);
        this.content = segment['content']
    }

    ToMiraiCode(): string {
        return `[mirai:app:${escapeMirai(this.content)}]`
    }

    ToLog(): string {
        return `[APP]`;
    }
}

enum PokeType {
    Poke = "Poke",
    ShowLove = "ShowLove",
    Like = "Like",
    Heartbroken = "Heartbroken",
    SixSixSix = "SixSixSix",
    FangDaZhao = "FangDaZhao",
}

class Poke extends MessageSegment implements EncodeAbleMessage {
    name: PokeType

    constructor(segment: object) {
        super(segment);
        this.name = segment['name']
    }

    ToMiraiCode(): string {
        return `[mirai:poke]`
    }

    ToLog(): string {
        return `[戳]`;
    }
}

class Dice extends MessageSegment implements EncodeAbleMessage {
    value: number

    constructor(segment: object) {
        super(segment);
        this.value = segment['value']
    }

    ToMiraiCode(): string {
        return `[mirai:dice:${this.value}]`
    }

    ToLog(): string {
        return `[骰子:${this.value}]`;
    }
}

class MarketFace extends MessageSegment {
    id: number
    name: string

    constructor(segment: object) {
        super(segment);
        this.id = segment['id']
        this.name = segment['name']
    }

    ToLog(): string {
        return `[大表情:${this.name}]`;
    }
}

class MusicKindClass {

    appId: number
    platform: number
    sdkVersion: string
    packageName: string
    signature: string

    constructor(appId: number, platform: number, sdkVersion: string, packageName: string, signature: string) {
        this.appId = appId
        this.platform = platform
        this.sdkVersion = sdkVersion
        this.packageName = packageName
        this.signature = signature
    }

}

namespace MusicKind {
    let NeteaseCloudMusic = new MusicKindClass(
        100495085,
        1,
        "0.0.0",
        "com.netease.cloudmusic",
        "da6b069da1e2982db3e386233f68d76d")
    let QQMusic = new MusicKindClass(
        100497308,
        1,
        "0.0.0",
        "com.tencent.qqmusic",
        "cbd27cd7c861227d013a25b2d10f0799"
    )
    let MiguMusic = new MusicKindClass(
        1101053067,
        1,
        "0.0.0",
        "cmccwm.mobilemusic",
        "6cdc72a439cef99a3418d2a78aa28c73"
    )


    let KugouMusic = new MusicKindClass(
        205141,
        1,
        "0.0.0",
        "com.kugou.android",
        "fe4a24d80fcf253a00676a808f62c2c6"
    )


    let KuwoMusic = new MusicKindClass(
        100243533,
        1,
        "0.0.0",
        "cn.kuwo.player",
        "bf9ff4ffb4c558a34ee3fd52c223ebf5"
    )

}

class MusicShare extends MessageSegment implements EncodeAbleMessage {
    kind: string
    title: string
    summary: string
    jumpUrl: string
    pictureUrl: string
    musicUrl: string
    brief: string

    constructor(segment: object) {
        super(segment);
        this.kind = segment['kind']
        this.title = segment['title']
        this.summary = segment['summary']
        this.jumpUrl = segment['jumpUrl']
        this.pictureUrl = segment['pictureUrl']
        this.musicUrl = segment['musicUrl']
        this.brief = segment['brief']
    }

    ToMiraiCode(): string {
        return `[mirai:musicshare:
        ${escapeMirai(this.kind)},${escapeMirai(this.title)},${escapeMirai(this.summary)},
        ${escapeMirai(this.jumpUrl)},${escapeMirai(this.pictureUrl)},${escapeMirai(this.brief)}]`
    }

    ToLog(): string {
        return `[音乐:${this.title}]`;
    }
}

class ForwardMessageDisplay {
    title: string
    brief: string
    source: string
    preview: string[]
    summary: string
}

class NodeRef {
    messageId: number
    target: number
}

class ForwardMessageNode {
    "senderId": number
    "time": number
    "senderName": string
    "messageChain": MessageChain
    "messageId": number
    "messageRef": NodeRef
}

class ForwardMessage extends MessageSegment {
    display: ForwardMessageDisplay
    nodeList: ForwardMessageNode

    constructor(segment: object) {
        super(segment);
        this.display = segment['segment']
        this.nodeList = segment['nodeList']
    }

    ToLog(): string {
        return `[转发消息]`;
    }

}

class File extends MessageSegment implements EncodeAbleMessage {
    id: string
    name: string
    size: number

    private internalId: string;

    constructor(segment: object) {
        super(segment);
        this.id = segment['id']
        this.name = segment['name']
        this.size = segment['size']
    }

    ToMiraiCode(): string {
        return `[mirai:file:${escapeMirai(this.id)},${escapeMirai(this.internalId)},${escapeMirai(this.name)},${this.size}]`
    }

    ToLog(): string {
        return `[文件:${this.name}]`;
    }
}

class MiraiCode extends MessageSegment {
    code: string

    constructor(segment: object) {
        super(segment);
        this.code = segment['code']

    }

    ToLog(): string {
        return `[Mirai:${this.code}]`;
    }
}

export {MessageChain, MessageSegment}
export {
    Source,
    Poke,
    ForwardMessage,
    Face,
    FlashImage,
    Quote,
    File,
    At,
    Xml,
    MarketFace,
    App,
    NodeRef,
    Plain,
    MiraiCode,
    Voice,
    Image,
    ForwardMessageNode,
    Dice,
    Json,
    AtAll,
    MusicShare
}