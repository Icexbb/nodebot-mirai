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
export function StringLength(str: string): number {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
            len += 2;
        } else {
            len++;
        }
    }
    return len
}
export function FixedString(str: string, len: number): string {
    let cut = ""
    for (let i = 0; i < str.length; i++) {
        if (StringLength(cut) >= len) break;
        cut += str[i]
    }
    if (cut.length < str.length) cut += "..."
    return cut
}