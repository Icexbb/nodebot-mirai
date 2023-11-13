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
export function Choices<T>(list: T[], limit: number = 1): T[] {
    let result = []
    let lsIndex = []
    if (limit > list.length) limit = list.length
    else {
        for (let i = 0; i < limit; i++) {
            let index = Math.floor(Math.random() * list.length)
            if (lsIndex.includes(index)) {
                i--
                continue
            } else {
                lsIndex.push(index)
            }
        }
    }
    lsIndex.forEach((v) => {
        result.push(list[v])
    })
    return result
}
export function Shuffle<T>(list: T[]): T[] {
    let shuffled = list
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    return shuffled
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