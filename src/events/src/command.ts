import { FriendInfo, GroupMemberInfo } from "../../class.js";
import { CommandEvent } from "./base.js";

class CommandExecutedEvent extends CommandEvent {
    name: string
    friend?: FriendInfo
    member?: GroupMemberInfo
    args: { type: string, text: string }[]
    constructor(event: object) {
        super(event);
        this.name = event['name']
        this.friend = event['friend']
        this.member = event['member']
        this.args = event['args']
    }

    toLog(): string {
        return `Command Excuted: /${this.name} ${this.args.map((arg) => arg.text).join(' ')}`
    }
}
function GetCommandEvent(event: object): CommandExecutedEvent {
    switch (event['type']) {
        case 'CommandExecutedEvent': return new CommandExecutedEvent(event);
    }
    return null;
}
export { GetCommandEvent, CommandExecutedEvent }