import readLine from 'readline';
import chalk from 'chalk';
import events from 'events';
import { WsApiCaller } from './api.js';
import { NewSegment } from './message/index.js';

let rl = readLine.createInterface({
    input: process.stdin, output: process.stdout, tabSize: 4, prompt: "", historySize: 0
})
rl.prompt(false)
rl.on('close', () => { process.exit(0); });

class Logger {
    buffer: string[]
    lastLineIsCommand: boolean
    command: events.EventEmitter = new events.EventEmitter()
    apiCaller: WsApiCaller
    readLineInterface = rl
    constructor() {
        this.buffer = [];
        this.lastLineIsCommand = false
        process.stdin.on('data', (data) => {
            let char = data.toString()
            switch (char) {
                case "\r":
                    let args = this.buffer.join("");
                    this.buffer = [];
                    this.command.emit("line", args.split(" "));
                    this.prompt();
                    break;
                case "\b": this.buffer.pop(); this.prompt(); break;
                case "\u001b[A": break;
                case "\u001b[D": break;
                default: this.buffer.push(char); break;
            }

        })
        const ApiHandler = function (...args: string[]) {
            let command = args[0]
            let argsList = {}
            args.slice(1).forEach((pair) => {
                let value: any, key: string
                if (pair.indexOf("=") === -1) { return }
                [key, value] = pair.trim().split("=", 2)
                if (key === "") { return }
                if (key === undefined) { return }
                if (key.startsWith('"') && key.endsWith('"')) { key = key.slice(1, -1) }

                if (value === "true" || value === "false") { value = value === "true" }
                if (value === "null") { value = null }
                if (value === "undefined") { value = undefined }
                if (value === undefined) { return }
                if (value === null) { return }
                try {
                    argsList[key] = JSON.parse(value)
                } catch (error) { argsList[key] = value }
            })
            if (command === "" || command === undefined) {
                this.console("Usage: api <command> [args...]")
            } else {
                this.apiCaller.makeApiCall(command, argsList)
            }
        }
        const consoleReply = function (...args: string[]) {
            let group = parseInt(args[0])
            let msgId = parseInt(args[1])
            if (Number.isNaN(group) || Number.isNaN(msgId)) {
                this.console("Usage: reply <group> <msgId> [message...]")
                return
            }
            let msg = [NewSegment.Plain(args.slice(2).join(" "))]
            this.apiCaller.makeApiCall("sendGroupMessage", { messageChain: msg, target: group, group: group, quote: msgId })
        }
        const consoleSend = function (...args: string[]) {
            let group = parseInt(args[0])
            if (Number.isNaN(group)) {
                this.console("Usage: send <group> [message...]")
                return
            }
            let msg = [NewSegment.Plain(args.slice(1).join(" "))]
            this.apiCaller.makeApiCall("sendGroupMessage", { messageChain: msg, target: group, group: group })

        }
        this.command.on("line", (line: string[]) => {
            switch (line[0].toLowerCase().trim()) {
                case "exit": case "quit": this.console("Bot Terminated"); process.exit(0);
                case "echo": this.console(line.slice(1).join(" ")); break;
                case "ping": this.console("pong"); break;
                case "clear": process.stdout.write("\u001b[2J\u001b[0;0H"); this.buffer = []; break;
                case "api": ApiHandler.apply(this, line.slice(1)); break;
                // case "help": this.console("exit,quit,echo,ping,clear,api,help"); break;
                case "reply": consoleReply.apply(this, line.slice(1)); break;
                case "send":
                case "": break;
                default: this.console(`Unknown Command: ${line[0].trim()}`); break;
            }
        })
    }
    registerApiCaller(apiCaller: WsApiCaller) {
        this.apiCaller = apiCaller
    }

    static stringify(...message: any[]) {
        let msg = [];
        message.forEach(element => {
            switch (typeof element) {
                case "undefined": msg.push("undefined"); break;
                case "object": msg.push(JSON.stringify(element)); break;
                case "string": msg.push(element); break;

                case "boolean": case "number":
                case "bigint": case "symbol":
                case "function": default: msg.push(element.toString()); break;
            }
        });
        return msg.join(" ")
    }
    log_ = (prefix?: string, ...message: any[]) => {
        let msg = Logger.stringify(...message)
        msg.split("\n").forEach((element) => { Logger.write(prefix + element + "\n") })
        if (msg !== "exit") { this.prompt() }
    }
    log = (...message: any[]) => { this.log_("", ...message) }
    success = (...message: any[]) => { this.log_(chalk.bold.green('SUCCESS') + " | ", ...message) }
    info = (...message: any[]) => { this.log_(chalk.bold.white('INFO') + " | ", ...message) }
    warn = (...message: any[]) => { this.log_(chalk.bold.yellow('WARN') + " | ", ...message) }
    error = (...message: any[]) => { this.log_(chalk.bold.red('ERROR') + " | ", ...message) }
    debug = (...message: any[]) => { this.log_(chalk.bold.magenta('DEBUG') + " | ", ...message) }
    console = (...message: any[]) => { this.log_(chalk.bold.cyan('CONSOLE') + " | ", ...message) }
    prompt = () => { Logger.write(">>> " + this.buffer?.join("")) }
    static write(str: string) {
        let time = new Date().toLocaleString()
        process.stdout.write(`\r` + chalk.blue(`${time}`) + chalk.bold(' | ') + `${str}`)
    }

}
var logger = new Logger()
export { Logger, logger }