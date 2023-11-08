import { Service } from "../../src/index.js";

class ServiceTemplate extends Service {
    constructor() {
        super("Template", { enabledDefault: false })
        this.visible = false
    }
    registerResponser() {
        this.onGroupMessage(/.?/, (service, event, matchRes) => {
        })
    }
}
const service = new ServiceTemplate()
export default service;