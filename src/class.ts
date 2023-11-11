import * as fs from 'node:fs';

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
        let usedName = fs.readdirSync(ConfiguredBotObject.fromConfigRoot())
            .filter((file) => { return file.endsWith(".json") })
            .map((file) => { return file.substring(0, file.length - 5) })
            .filter((file) => { return !reservedName.includes(file) })

        if (this.type == "bot" || this.type == "permission") {
            return !usedName.includes(name)
        } else {
            return !reservedName.includes(name) // && !usedName.includes(name)
        }
    }
    static fromConfigRoot(...path: string[]): string {
        let root = process.cwd() + ['', 'data', ...path].join("/");
        if (process.platform == "win32") root = root.replaceAll("/", "\\")
        else root = root.replaceAll("\\", "/")
        return root
    }
    protected constructor(name: string, type: string = "service") {
        this.type = type
        if (!this.NameIsValide(name)) throw new Error(`Object name ${name} is not valide`)
        this.name = name;
        this.configPath = ConfiguredBotObject.fromConfigRoot(`${this.name}.json`);
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
