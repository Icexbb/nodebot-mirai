import readLine from 'readline';
import chalk from 'chalk';
import events from 'events';
import fs from 'fs';
import path from 'path';
import { WsApiCaller } from './api.js';
import { NewSegment } from './message/index.js';
import { NodeBot } from './bot.js';

let rl = readLine.createInterface({
    input: process.stdin, output: process.stdout,
    tabSize: 4, prompt: "", historySize: 0
})
rl.prompt(false)
rl.on('close', () => { process.exit(0); });

class Logger {
    buffer: string[]
    lastLineIsCommand: boolean
    command: events.EventEmitter = new events.EventEmitter()
    apiCaller: WsApiCaller
    readLineInterface = rl
    consoleLevel: number;
    bot: NodeBot;
    recordLevel: number;
    logFileName: string;
    constructor(bot: NodeBot, level: number = 2, recordLevel: number = 3) {
        this.buffer = [];
        this.lastLineIsCommand = false;
        this.consoleLevel = level;
        this.recordLevel = recordLevel;
        this.bot = bot
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
        const consoleApi = function (...args: string[]) {
            if (this.apiCaller === undefined)
                this.console("Api Caller Not Registered")
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
                this.apiCaller.makeApiCall(command, argsList).then((data: any) => {
                    this.console(JSON.stringify(data))
                })
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
        // const consoleService = function (...args: string[]) {}
        const consoleHelp = function (...args: string[]) { }
        const consoleReload = function (...args: string[]) {
            if (args.length === 0) {
                this.console("Usage: reload <group> [message...]")
                return
            }
            if (args[0] === "all") {
                this.bot.reloadAllService()
                return
            }
            for (let sv of args) {
                if (this.bot.ServiceSet[sv] === undefined) {
                    this.console(`Service ${sv} not found`)
                } else {
                    this.bot.reloadService(sv)
                }
            }
        }

        this.command.on("line", (line: string[]) => {
            switch (line[0].toLowerCase().trim()) {
                case "exit": case "quit": this.console("Bot Terminated"); process.exit(0);
                case "echo": this.console(line.slice(1).join(" ")); break;
                case "ping": this.console("pong"); break;
                case "clear": process.stdout.write("\u001b[2J\u001b[0;0H"); this.buffer = []; break;
                case "api": consoleApi.apply(this, line.slice(1)); break;
                case "help": consoleHelp.apply(this, line.slice(1)); break;
                case "reply": consoleReply.apply(this, line.slice(1)); break;
                case "send": consoleSend.apply(this, line.slice(1)); break;
                case "reload": consoleReload.apply(this, line.slice(1)); break;
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
    private log_ = (level: number, prefix: string, ...message: any[]) => {
        let msg = Logger.stringify(...message)
        msg.split("\n").forEach((element) => { this.write(level, prefix + element + "\n") })
        if (msg !== "exit") { this.prompt() }
    }
    log = (...message: any[]) => { this.log_(0, "", ...message) }
    debug = (...message: any[]) => { this.log_(1, chalk.bold.magenta('DEBUG') + " | ", ...message) }

    console = (...message: any[]) => { this.log_(2, chalk.bold.cyan('CONSOLE') + " | ", ...message) }

    info = (...message: any[]) => { this.log_(3, chalk.bold.white('INFO') + " | ", ...message) }
    success = (...message: any[]) => { this.log_(4, chalk.bold.green('SUCCESS') + " | ", ...message) }

    warn = (...message: any[]) => { this.log_(5, chalk.bold.yellow('WARN') + " | ", ...message) }
    error = (...message: any[]) => { this.log_(6, chalk.bold.red('ERROR') + " | ", ...message) }

    prompt = () => { this.write(this.consoleLevel, ">>> " + this.buffer?.join("")) }
    write(level: number, str: string) {
        if (level < this.consoleLevel) return;
        let time = new Date().toLocaleString()
        let msg = `\r` + chalk.blue(`${time}`) + chalk.bold(' | ') + `${str}`
        process.stdout.write(msg)
        if (level < this.recordLevel) return;
        let logFile = this.getLogFilePath()
        fs.appendFileSync(logFile, (msg.trim() + "\n").replaceAll(this.colorEscape, ""))
    }
    colorEscape = /\x1B[@-_][0-?]*[ -/]*[@-~]/g
    getLogFilePath() {


        let time = new Date().toLocaleString()
        let logFileDate = time.split(" ")[0].split('/')
        let logFilePath = path.join(process.cwd(), "logs", ...logFileDate);
        fs.mkdirSync(logFilePath, { recursive: true })

        let filename: string;
        if (this.logFileName === undefined) {
            let logFileNum = fs.readdirSync(logFilePath).length
            filename = `${logFileNum}.log`
        } else {
            filename = this.logFileName
            let logFileNum = fs.readdirSync(logFilePath).length
            if (logFileNum == 0) filename = '0.json'
        }
        this.logFileName = filename
        let logFile = path.join(logFilePath, filename)
        return logFile
    }
}
export { Logger }