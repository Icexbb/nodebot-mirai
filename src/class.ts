import * as fs from 'node:fs';
import * as path from 'node:path';
export class FriendInfo {
    id: number
    nickname: string
    remark: string
}

export enum GroupPermission {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
}
export class GroupInfo {
    id: number
    name: string
    permission: GroupPermission
}
export class GroupMemberInfo {
    id: number
    memberName: string
    specialTitle: string
    permission: GroupPermission
    joinTimestamp: number
    lastSpeakTimestamp: number
    muteTimeRemaining: number
    group: GroupInfo
}
export class ClientInfo {
    id: number
    platform: string
}

export class ConfiguredBotObject {
    name: string;
    configPath: string;
    type: string
    NameIsValide(name: string): boolean {
        let reservedName = ['bot', 'permission']
        let usedName = fs.readdirSync(this.fromConfigRoot(this.type))
            .filter((file) => file.endsWith(".json"))
            .map((file) => file.substring(0, file.length - 5))
            .filter((file) => !reservedName.includes(file))

        if (this.type == "bot" || this.type == "permission") {
            return !usedName.includes(name)
        } else {
            return !reservedName.includes(name) // && !usedName.includes(name)
        }
    }
    fromConfigRoot(...path: string[]): string {
        let root = process.cwd() + ['', 'config', ...path].join("/");
        if (process.platform == "win32") root = root.replaceAll("/", "\\")
        else root = root.replaceAll("\\", "/")
        return root
    }
    protected constructor(name: string, type: string = "service") {
        this.type = type
        this.name = name;
        this.configPath = this.fromConfigRoot(this.type, `${this.name}.json`);
        if (!fs.existsSync(path.dirname(this.configPath))) {
            fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
        }
        if (!this.NameIsValide(name)) throw new Error(`Object name ${name} is not valide`)
        this.initConfig();
    }
    createConfig(template?: object) {
        let config = {};
        if (template) {
            for (let key in Object.keys(template)) {
                switch (typeof template[key]) {
                    case "string": config[key] = ""; break;
                    case "number": config[key] = 0; break;
                    case "bigint": config[key] = 0; break;
                    case "boolean": config[key] = false; break;
                    case "object": config[key] = {}; break;
                }
            }
        }
        this.setConfig(config, true);
    }
    initConfig() {
        if (!fs.existsSync(this.configPath)) this.createConfig();
        else {
            try {
                JSON.parse(fs.readFileSync(this.configPath).toString());
            } catch {
                this.createConfig();
            }
        }
    }
    setConfig(config: object, force: boolean = false) {
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 4))
    }
    getConfig() {
        return JSON.parse(fs.readFileSync(this.configPath).toString());
    }
}
