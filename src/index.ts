import { NodeBot } from "./bot.js";
import { Service } from "./service/service.js";
import { EventPremissionSolver } from "./service/permission.js";
import * as Segments from "./message/src/segment.js";
import * as Event from "./events/index.js";
module.exports = {
    NodeBot,
    Segments,
    Service,
    EventPremissionSolver,
    Event
}