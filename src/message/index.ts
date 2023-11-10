export {
    Source, Poke, Forward, Face, FlashImage, Quote, File, At, Xml, MarketFace,
    App, Plain, MiraiCode, Voice, Image, Dice, Json, AtAll, MusicShare,
} from "./src/segment.js"
export { MessageChain } from "./src/base.js"
export { GetMessage, NewSegment } from "./src/construct.js"
enum MessageSegmentTypes {
    Source = "Source",
    Poke = "Poke",
    Forward = "Forward",
    Face = "Face",
    FlashImage = "FlashImage",
    Quote = "Quote",
    File = "File",
    At = "At",
    Xml = "Xml",
    MarketFace = "MarketFace",
    App = "App",
    Plain = "Plain",
    MiraiCode = "MiraiCode",
    Voice = "Voice",
    Image = "Image",
    Dice = "Dice",
    Json = "Json",
    AtAll = "AtAll",
    MusicShare = "MusicShare"
}
export { MessageSegmentTypes }