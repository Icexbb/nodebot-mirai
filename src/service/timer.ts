import { ConfiguredBotObject } from "../class.js";
import schedule from "node-schedule"

class FreqLimiter extends ConfiguredBotObject {
    defaultTimeInterval: number;
    private data: { [key: string]: number };

    constructor(name: string, defaultTimeInterval: number = 60 * 1000) {
        super(name, "freqLimit");
        this.defaultTimeInterval = defaultTimeInterval;
        this.data = this.getConfig();
    }
    set(key: string, time: number = this.defaultTimeInterval) {
        this.data[key] = Date.now() + time;
        this.setConfig(this.data);

        const cancelLimit = (() => {
            delete this.data[key];
            this.setConfig(this.data);
        }).bind(this);
        setTimeout(cancelLimit, time);
    }
    check(key: string): boolean {
        if (this.data[key] === undefined) return true;
        else return false;
    }
}
class TimeLimiter extends ConfiguredBotObject {
    private data: { [key: string]: number };
    defaultTimeLimit: number;
    clearJob: schedule.Job;
    constructor(name: string, defaultTimeLimit: number = 10) {
        super(name, "timeLimit");
        this.defaultTimeLimit = defaultTimeLimit;
        this.data = this.getConfig();
        this.clearJob = schedule.scheduleJob("0 0 * * *", this.clear.bind(this));
    }
    clear() {
        this.data = {};
        this.setConfig(this.data);
    }
    add(key: string) {
        this.data[key] ??= 0;
        this.setConfig(this.data);
    }
    check(key: string): boolean {
        if (this.data[key] === undefined) return true;
        else return false;
    }

}
export { FreqLimiter, TimeLimiter }