'use client'

import { getPolygonCentroid, toLinearGrayColor, toSobelImageData } from "@/libs/canvasHelper";
import useCanvas from "@/libs/hooks/useCanvas";
import useForceUpdate from "@/libs/hooks/useForceUpdate";
import useImageLoad from "@/libs/hooks/useImageLoad";
import useInitialized from "@/libs/hooks/useInitialized";
import useResizeHandler from "@/libs/hooks/useResizeHandler";
import useScrollValue from "@/libs/hooks/useScrollValue";
import { deBounce } from "@/libs/utils";
import { ImageWorkerResult } from "@/types";
import { Delaunay } from "d3-delaunay";
import { da } from "date-fns/locale";
import { useControls } from "leva";
import { useCallback, useEffect, useMemo, useRef } from "react";


type ViewerInfo = {
    mode: 'invert' | 'normal' | 'sobel',
    grayScale: {
        normal: Float32Array,
        invert: Float32Array
    },
    scaleRatio: number;
    sobelData: Float32Array,
    imageData: ImageData;
    context: CanvasRenderingContext2D,
    normalContext: OffscreenCanvasRenderingContext2D,
    invertContext: OffscreenCanvasRenderingContext2D,
    offScreen: OffscreenCanvas
}


const initViewerInfo = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
    //초기 이미지 정보 설정
    ctx.canvas.width = img.width;
    ctx.canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const normalContext = new OffscreenCanvas(img.width, img.height).getContext('2d', { willReadFrequently: true })!;
    const invertContext = new OffscreenCanvas(img.width, img.height).getContext('2d', { willReadFrequently: true })!;
    //console.log('invert', invertContext)
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    ctx.clearRect(0, 0, img.width, img.height);
    const grayScale = toLinearGrayColor(imageData);
    const { sobel } = toSobelImageData(imageData, 1, false, 4, 80);
    const offScreen = new OffscreenCanvas(img.width, img.height);
    return {
        sobelData: sobel,
        imageData,
        grayScale,
        context: ctx,
        normalContext,
        invertContext,
        offScreen
    }
}

const WORKER_TYPES = {
    NORMAL: 'normal',
    INVERT: 'invert',
} as const;
const workerMap = new Map<string, Worker>();

const registWorker = (key: string, worker: Worker) => {
    if (!workerMap.has(key)) {
        workerMap.set(key, worker);
    }
}

const unRegistWorker = (key: string, worker: Worker) => {
    if (workerMap.has(key)) {
        workerMap.delete(key);
    }
}

function MainVisual({ url, className, children }: { url?: string, className: string, children: React.ReactNode }) {

    const { mixRatio, image, onlyInvert, onlyNormal } = useControls({
        mixRatio: {
            value: 0.5,
            min: 0,
            max: 1,
            step: 0.1
        },
        image: {
            options: Array.from({ length: 31 }, (_, k) => `profile_${k + 1}`),
            value: 'profile_1'
        },
        onlyInvert: true,
        onlyNormal: false,
    });

    const { ctx, ref } = useCanvas();
    const img = useImageLoad(`/images/thumb/${image}.png`);

    const viewerInfo = useRef<ViewerInfo>({
        mode: 'normal',
        grayScale: null!,
        imageData: null!,
        scaleRatio: -1,
        sobelData: null!,
        context: null!,
        normalContext: null!,
        invertContext: null!,
        offScreen: null!
    });


    const { y: scrollY } = useScrollValue();

    const mixWorkerImage = useCallback(({ mixRatio, onlyInvert, onlyNormal }: any) => {

        const { context, invertContext, normalContext, offScreen, scaleRatio } = viewerInfo.current;
        if (context && scaleRatio > 0) {

            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.save();
            const cWidth = normalContext.canvas.width * scaleRatio;
            const cHeight = normalContext.canvas.height * scaleRatio;
            const x = (context.canvas.width - cWidth) >> 1;
            const y = (context.canvas.height - cHeight) >> 1;
            context.imageSmoothingEnabled = true;
            // context.imageSmoothingQuality = "high";
            if (onlyNormal && !onlyInvert) {
                context.drawImage(normalContext.canvas, x, y, cWidth, cHeight);
            } else if (onlyInvert && !onlyNormal) {
                // console.log('인버스만 그리기');
                context.drawImage(invertContext.canvas, x, y, cWidth, cHeight);
                // context.drawImage(offScreen, x, y, cWidth, cHeight);
            } else if (onlyInvert && onlyNormal) {
                // console.log('둘다그리기');
                context.globalAlpha = mixRatio;
                context.drawImage(invertContext.canvas, x, y, cWidth, cHeight);
                context.drawImage(normalContext.canvas, x, y, cWidth, cHeight);
                context.globalAlpha = 1;
            }
            context.restore();
        }

    }, []);

    const onNormalMessageHandler = useCallback(({ data }: MessageEvent<ImageWorkerResult>) => {

        if (data) {
            const { normalContext, imageData } = viewerInfo.current;
            const { points, weights } = data;

            normalContext.save();
            normalContext.clearRect(0, 0, normalContext.canvas.width, normalContext.canvas.height);
            normalContext.beginPath();
            const d = new Delaunay(points);
            let i = 0;
            for (let triangles of d.trianglePolygons()) {
                const [cx, cy] = getPolygonCentroid(triangles);
                const c = (~~cy * normalContext.canvas.width + ~~cx) * 4;
                normalContext.beginPath();
                normalContext.moveTo(triangles[0][0], triangles[0][1]);
                for (let i = 1; i < triangles.length; i++) {
                    normalContext.lineTo(triangles[i][0], triangles[i][1]);
                }
                normalContext.fillStyle = `rgb(${imageData.data[c]},${imageData.data[c + 1]},${imageData.data[c + 2]})`;
                normalContext.strokeStyle = normalContext.fillStyle;
                normalContext.fill();
                normalContext.stroke();
                normalContext.closePath();
                i++;
            }


            normalContext.restore();

            ;


            /* normalContext.fillStyle = 'black';
            normalContext.fillRect(0, 0, normalContext.canvas.width, normalContext.canvas.height);
            normalContext.save();
            for (let i = 0; i < points.length; i += 2) {
                const x = points[i];
                const y = points[i + 1];
                const w = weights[i >> 1];
                if (w > .5) {
                    normalContext.beginPath();
                    normalContext.fillStyle = 'white';
                    normalContext.arc(x, y, Math.sqrt(w / 4), 0, Math.PI * 2);
                    normalContext.fill();
                    normalContext.closePath();
                }
            }
            normalContext.restore(); */

        }
    }, []);

    const onInvertMessageHandler = useCallback(({ data }: MessageEvent<ImageWorkerResult>) => {
        if (data) {
            const { invertContext, imageData } = viewerInfo.current;
            const { points } = data;
            // console.log('d', points);
            // invertContext.fillStyle = 'white';
            invertContext.clearRect(0, 0, invertContext.canvas.width, invertContext.canvas.height);
            // invertContext.lineWidth = .1;
            invertContext.save();
            invertContext.beginPath();
            const d = new Delaunay(points);
            //.voronoi([0, 0, invertContext.canvas.width, invertContext.canvas.height]);
            d.render(invertContext);
            //invertContext.fill();
            invertContext.stroke();
            invertContext.closePath();
            invertContext.restore();
            // for (let cell of v.cellPolygons()) {
            //     invertContext.beginPath();
            //     invertContext.moveTo(cell[0][0], cell[0][1]);
            //     // console.log('cell', cell);
            //     const [cx, cy] = getPolygonCentroid(cell);
            //     const c = (~~cy * invertContext.canvas.width + ~~cx) * 4;
            //     invertContext.fillStyle = `rgb(${imageData.data[c]},${imageData.data[c + 1]},${imageData.data[c + 2]})`;
            //     for (let i = 1; i < cell.length; i++) {
            //         invertContext.lineTo(cell[i][0], cell[i][1]);
            //     }
            //     invertContext.fill();
            //     invertContext.closePath();
            // }


            /* for (let i = 0; i < points.length; i += 2) {
                const x = points[i];
                const y = points[i + 1];
                let w = weights[i >> 1];
                if (w > .5) {
                    invertContext.beginPath();
                    invertContext.fillStyle = 'black';
                    invertContext.arc(x, y, Math.sqrt(w / 2), 0, Math.PI * 2);
                    invertContext.fill();
                    invertContext.closePath();
                }
            } */



        }
    }, []);

    const onErrorHandler = useCallback((error: ErrorEvent) => {
        console.log('error', error);
    }, []);



    const redraw = useMemo(() => {
        return deBounce(() => {

            if (viewerInfo.current.imageData) {
                const { context, imageData, grayScale, offScreen } = viewerInfo.current;
                const { width, height } = imageData;

                const pointNum = (width * height) / (4 * 4);

                context.clearRect(0, 0, context.canvas.width, context.canvas.height);

                const normalWorker = workerMap.get(WORKER_TYPES.NORMAL);
                const invertWorker = workerMap.get(WORKER_TYPES.INVERT);

                normalWorker?.postMessage({
                    colorWeights: grayScale.normal,
                    width,
                    height,
                    pointNum: ~~(pointNum),
                    iteration: 40
                });

                invertWorker?.postMessage({
                    colorWeights: grayScale.invert,
                    width,
                    height,
                    pointNum: ~~(pointNum),
                    iteration: 40,

                });


            }
        });
    }, []);

    const canvasSync = useMemo(() => {
        return deBounce(() => {

            if (viewerInfo.current.imageData) {
                const { imageData, context } = viewerInfo.current;

                const scale = window.devicePixelRatio;
                const cw = context.canvas.parentElement!.clientWidth;
                const ch = context.canvas.parentElement!.clientHeight;
                context.canvas.style.width = `${cw}px`;
                context.canvas.style.height = `${ch}px`;
                context.canvas.dataset.w = cw.toString();
                context.canvas.dataset.h = ch.toString();
                // 이전 현재 스케일 계산
                context.canvas.width = cw * scale;
                context.canvas.height = ch * scale;
                //이미지 정보가 있으면 redraw;
                const { width, height } = imageData;
                viewerInfo.current.scaleRatio = Math.min(cw / width, ch / height) * devicePixelRatio;

                redraw();
            }
        })
    }, [redraw]);


    useEffect(() => {

        const normalWorker = new Worker(new URL("../worker/normalWorker", import.meta.url));
        const invertWorker = new Worker(new URL("../worker/invertWorker", import.meta.url));

        registWorker(WORKER_TYPES.NORMAL, normalWorker);
        registWorker(WORKER_TYPES.INVERT, invertWorker);

        normalWorker.onmessage = onNormalMessageHandler;
        invertWorker.onmessage = onInvertMessageHandler;
        normalWorker.onerror = onErrorHandler;
        invertWorker.onerror = onErrorHandler;

        return () => {
            normalWorker.terminate();
            invertWorker.terminate();
            workerMap.clear()
        }

    }, [onNormalMessageHandler, onInvertMessageHandler, onErrorHandler]);

    useEffect(() => {
        if (ctx) {
            const rect = ctx.canvas.parentElement!.getBoundingClientRect();
            const childrenElement = ctx.canvas.parentElement!.children;
            const ratio = Math.min(1, scrollY / rect.height);
            const diff = (rect.height * ratio) * .5;
            for (let i = 0; i < childrenElement.length; i++) {
                (childrenElement[i] as HTMLElement).style.transform = `translateY(${diff}px)`;
                if (i === 0) {
                    (childrenElement[i] as HTMLElement).style.opacity = (1 - ratio).toString();
                }
            }
        }
    }, [ctx, scrollY]);


    useEffect(() => {
        if (img && ctx) {
            viewerInfo.current = { ...viewerInfo.current, ...initViewerInfo(img, ctx) };
            canvasSync();
        }
    }, [ctx, img, canvasSync]);

    useResizeHandler(canvasSync);



    useEffect(() => {

        const render = () => {
            const { imageData } = viewerInfo.current;
            if (imageData) {
                mixWorkerImage({ mixRatio, onlyInvert, onlyNormal });
            }
            animateID = requestAnimationFrame(render)
        }

        let animateID = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animateID);
        }

    }, [mixRatio, onlyInvert, onlyNormal, mixWorkerImage]);


    return (
        <div className={ className }>
            <canvas className="absolute" ref={ ref }></canvas>
            { children }
        </div>
    )
}



export default MainVisual;