import { Service } from "../../src/index.js";
import { MessageSegmentTypes } from "../../src/message/index.js";

class ServiceTemplate extends Service {
    constructor() {
        super("template", { enabledDefault: false })
        this.visible = false
    }
    registerResponser() {
        /*Match Any Message*/
        this.onGroupMessageText(/.?/, (service, event, matchRes) => { })
        /*Equal as Above*/
        this.onAnyGroupMessage((service, event) => { })
        /*Match Any Group Message with Image*/
        this.onGroupMessagePart(MessageSegmentTypes.Image, (service, event) => { })
    }
}
const service = new ServiceTemplate()
export default service;