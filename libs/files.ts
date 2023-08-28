import { readdirSync, statSync } from "fs";
import path from "path";
import { curryMap, pipe } from "./utils";
import { CONTENT_PATH } from "@/const";


const joinPath = (prefix: string) => (filePath: string) => path.join(prefix, filePath);

const visitFolder = (filePath: string) => statSync(filePath).isFile() ? filePath : getFileList(filePath);
const flatArray = (fileList: string[]) => fileList.flatMap(l => l);

const getFileList = (location: string) => {
    return pipe(
        readdirSync,
        curryMap(pipe(joinPath(location), visitFolder)),
        flatArray
    )(location);
}

const getContentPath = joinPath(CONTENT_PATH);


const clearMDXExtension = (str: string) => str.replace(/\.mdx$/, '');


export {
    joinPath,
    getFileList,
    getContentPath,
    clearMDXExtension
}