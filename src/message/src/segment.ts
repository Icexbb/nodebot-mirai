import { MessageSegment, EncodeAbleMessage, escapeMirai } from "./base.js";
import { ForwardMessageNode, ForwardMessageDisplay } from "./base.js";

class Source extends MessageSegment {
    id: number
    time: number

    constructor(segment: object) {
        super(segment);
        this.id = segment['id']
        this.time = segment['time']
    }

    toLog(): string {
        return "";
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Source") return false;
        return true;
    }
}

class Quote extends MessageSegment {
    id: number
    groupId: number
    senderId: number
    targetId: number
    origin: MessageSegment[]

    constructor(segment: object) {
        super(segment);
        this.id = segment['id']
        this.groupId = segment['groupId']
        this.senderId = segment['senderId']
        this.targetId = segment['targetId']
        this.origin = segment['origin']
    }

    toLog(): string {
        return `[>${this.id}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Quote") return false;
        return this.id == (other as Quote).id;
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

    toLog(): string {
        return `[@${this.target}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "At") return false;
        return this.target == (other as At).target;
    }
}

class AtAll extends MessageSegment implements EncodeAbleMessage {
    constructor(segment: object) {
        super(segment);
    }

    ToMiraiCode(): string {
        return `[mirai:atall]`
    }

    toLog(): string {
        return `[@ALL]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "AtAll") return false;
        return true
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

    toLog(): string {
        return `[Face:${this.name}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Face") return false;
        return this.faceId == (other as Face).faceId || this.name == (other as Face).name;
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

    toLog(): string {
        return this.text;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Plain") return false;
        return this.text == (other as Plain).text;
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

    toLog(): string {
        return `[IMG:${this.url}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Image") return false;
        return this.imageId == (other as Image).imageId;
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

    toLog(): string {
        return `[FIMG:${this.url}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "FlashImage") return false;
        return this.imageId == (other as FlashImage).imageId;
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

    toLog(): string {
        return `[Voice:${this.url}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Voice") return false;
        return this.voiceId == (other as Voice).voiceId;

    }
}

class Xml extends MessageSegment {
    xml: string

    constructor(segment: object) {
        super(segment);
        this.xml = segment['xml']
    }

    toLog(): string {
        return `[XML]`;
    }//TODO
    equals(other: MessageSegment): boolean {
        return false
    }
}

class Json extends MessageSegment {
    json: string

    constructor(segment: object) {
        super(segment);
        this.json = segment['json']
    }

    toLog(): string {
        return `[JSON]`;
    }
    equals(other: MessageSegment): boolean {
        return false
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

    toLog(): string {
        return `[APP]`;
    }
    equals(other: MessageSegment): boolean {
        return false
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

    toLog(): string {
        return `[Poke:${this.name}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "Poke") return false;
        return this.name == (other as Poke).name;
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

    toLog(): string {
        return `[Dice:${this.value}]`;
    }
    equals(other: MessageSegment): boolean {
        return false
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

    toLog(): string {
        return `[${this.name}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "MarketFace") return false;
        return this.id == (other as MarketFace).id;
    }
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

    toLog(): string {
        return `[MusicShare:${this.title}]`;
    }
    equals(other: MessageSegment): boolean {
        return false
    }
}

class Forward extends MessageSegment {
    display: ForwardMessageDisplay
    nodeList: ForwardMessageNode

    constructor(segment: object) {
        super(segment);
        this.display = segment['display']
        this.nodeList = segment['nodeList']
    }

    toLog(): string {
        return `[Forward:${JSON.stringify(this)}]`;
    }//TODO
    equals(other: MessageSegment): boolean {
        return false
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

    toLog(): string {
        return `[File:${this.name}]`;
    }
    equals(other: MessageSegment): boolean {
        return false
    }
}

class MiraiCode extends MessageSegment {
    code: string

    constructor(segment: object) {
        super(segment);
        this.code = segment['code']

    }

    toLog(): string {
        return `[Mirai:${this.code}]`;
    }
    equals(other: MessageSegment): boolean {
        if (other.type != "MiraiCode") return false;
        return this.code == (other as MiraiCode).code;
    }
}

export {
    Source, Poke, Forward, Face, FlashImage, Quote, File, At, Xml, MarketFace,
    App, Plain, MiraiCode, Voice, Image, Dice, Json, AtAll, MusicShare,
}