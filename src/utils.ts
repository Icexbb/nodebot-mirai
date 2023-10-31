import { Md5 } from 'ts-md5';
export function Hash(...objects: any[]): string {
    let md5 = new Md5();
    objects.forEach(object => {
        md5.appendStr(JSON.stringify(object)??"")
    })
    return md5.end() as string;
}