// 상수모음
import { faClipboardList, faClipboardQuestion, faClipboardUser, faFileCode } from "@fortawesome/free-solid-svg-icons";

import path from "path";
import { MenuProps } from "./types";


const ITEM_PAGE_PER = 5;
const POST_EXTENSION = 'mdx';
const CONTENT_PATH = path.join(process.cwd(), 'content');

//localFont
const PREFERS_COLOR = {
    DARK: 'dark',
    LIGHT: 'light'
} as const


enum WORKER_MESSAGE {
    INITIALIZE = 'INITIALIZE',
    IMAGE_CHANGE = 'IMAGE_CHANGE',
    RESIZE = 'RESIZE',
    DRAW = 'DRAW',
    SYNC = 'SYNC',
    WORK_PROGRESS_BEFORE = 'WORK_PROGRESS_BEFORE',
    WORK_PROGRESS_ING = 'WORK_PROGRESS_ING',
    WORK_PROGRESS_COMPLETE = 'WORK_PROGRESS_COMPLETE'
}

enum ProgressState {
    DEFAULAT,
    INIT,
    PROGRESS,
    COMPLETE
}

const menus: MenuProps[] = [
    {
        link: '/posts',
        label: '블로그',
        title: '개발관련',
        icon: faClipboardList,
    },
    {
        link: "/snippet",
        label: '코드조각',
        title: '참고용 코드모음',
        icon: faFileCode
    },
    {
        link: '/project',
        label: '프로젝트',
        title: "프로젝트",
        icon: faClipboardQuestion
    },
    {
        link: '/about',
        label: '공간소개',
        icon: faClipboardUser
    },
    // {
    //     link: '/tags',
    //     label: 'tags',
    //     icon: faClipboard
    // },
]

export {
    ITEM_PAGE_PER,
    POST_EXTENSION,
    CONTENT_PATH,
    menus,
    PREFERS_COLOR,
    WORKER_MESSAGE,
    ProgressState
};