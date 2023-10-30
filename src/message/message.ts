import * as Segments from "./segment.js";

export function GetMessage(data:object[]):Segments.MessageChain{
    let result = [] as Segments.MessageChain
    data.forEach((value)=>{
        switch (value['type']){
            case "Source":result.push(new Segments.Source(value)); break;
            case "Poke":result.push(new Segments.Poke(value)); break;
            case "ForwardMessage":result.push(new Segments.ForwardMessage(value)); break;
            case "Face":result.push(new Segments.Face(value)); break;
            case "FlashImage":result.push(new Segments.FlashImage(value)); break;
            case "Quote":result.push(new Segments.Quote(value)); break;
            case "File":result.push(new Segments.File(value)); break;
            case "At":result.push(new Segments.At(value)); break;
            case "Xml":result.push(new Segments.Xml(value)); break;
            case "MarketFace":result.push(new Segments.MarketFace(value)); break;
            case "App":result.push(new Segments.App(value)); break;
            case "Plain":result.push(new Segments.Plain(value)); break;
            case "MiraiCode":result.push(new Segments.MiraiCode(value)); break;
            case "Voice":result.push(new Segments.Voice(value)); break;
            case "Image":result.push(new Segments.Image(value)); break;
            case "Dice":result.push(new Segments.Dice(value)); break;
            case "Json":result.push(new Segments.Json(value)); break;
            case "AtAll":result.push(new Segments.AtAll(value)); break;
            case "MusicShare":result.push(new Segments.MusicShare(value)); break;
            default:result.push(value as Segments.MessageSegment)
        }
    })
    return result

}