import { Md5 } from 'ts-md5';
export function Hash(...objects: any[]): string {
    let md5 = new Md5();
    objects.forEach(object => {
        md5.appendStr(JSON.stringify(object) ?? "")
    })
    return md5.end() as string;
}
export function isReg(text: string): boolean {
    let reg = new RegExp(/^\/.+\/$/)
    return reg.test(text)
}
export function Choice<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)]
}