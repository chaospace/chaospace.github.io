import { HTMLAttributes } from "react";
import { PREFERS_COLOR, WORKER_MESSAGE } from "./const";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type TFunc = (arg: any) => any;
type AsyncFunc = <T extends any, R extends T>(arg: T) => Promise<R>;
type FrontMatter = {
    title: string;
    date: Date;
    tags?: string[]
}

type THEME_MODE = typeof PREFERS_COLOR[keyof typeof PREFERS_COLOR];

type PostFrontMatter = FrontMatter & {
    slug: string;
    summary: string;
    readTime: number;
}

type TocHeading = {
    value: string;
    url: string;
    depth: number;
}


type ObjType<T> = {
    [Props in keyof T]: T[Props]
}

type ElementProps<T extends HTMLElement, K extends keyof T> = HTMLAttributes<Pick<T, K>>;

type DrawType = 'voronoi' | 'invert_dot' | 'normal_dot' | 'mix_dot' | 'sobel_invert' | 'sovel_normal';

type PointLike = {
    x: number,
    y: number
}

type ImageWorkerParams = {
    colorWeights: Float32Array;//포인트 제어에 사용되는 컬러가중치
    width: number;
    height: number;
    pointNum: number;  //포인트수
    iteration: number; //반복횟수
}

type ImageWorkerResult = {
    points: Float32Array;
    weights: Float32Array;
    minWeight?: number;
    maxWeight?: number;
    skip?: boolean;
}

type OffScreenWorkerParams = {
    state: WORKER_MESSAGE;
}

type OffScreenWorkerResponseParams = OffScreenWorkerParams & {
    progress: number;
}

type OffScreenWorkerRequestParams = OffScreenWorkerParams & ImageWorkerParams & {
    canvas: OffscreenCanvas;
    stage: DOMRect;
    imgData: ArrayBuffer;
    devicePixelRatio: number;
    url: string;
    drawType: DrawType;
}


type MenuProps = {
    link: string;
    label: string;
    icon?: IconProp
    target?: string;
    title?: string;
}

export type {
    TocHeading,
    MenuProps,
    ImageWorkerParams,
    ImageWorkerResult,
    OffScreenWorkerParams,
    OffScreenWorkerRequestParams,
    OffScreenWorkerResponseParams,
    TFunc,
    FrontMatter,
    PostFrontMatter,
    ObjType,
    AsyncFunc,
    THEME_MODE,
    ElementProps,
    PointLike
}

