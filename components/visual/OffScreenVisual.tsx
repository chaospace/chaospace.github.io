"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sampleImage } from "@/libs/workerParams";
import useImageLoad from "@/libs/hooks/useImageLoad";
import { toLinearGrayColor } from "@/libs/canvasHelper";
import { WORKER_MESSAGE } from "@/const";
import useResizeHandler from "@/libs/hooks/useResizeHandler";
import { deBounce } from "@/libs/utils";
import { OffScreenWorkerResponseParams } from "@/types";
import ProgressBar, { ProgressState } from "./ProgressBar";
import classNames from "classnames";
import CircleProgress from "./CircleProgress";
import useIsomorphicEffect from "@/libs/hooks/useIsomorphicEffect";




const setter = (current: { progress: number, state: ProgressState }, state: ProgressState, progress: number) => {
    return current.state !== state ? { progress, state } : { ...current, progress };
}

function OffScreenVisual({ className, children, url = '/images/santorini.jpg' }: { className?: string, children?: React.ReactNode, url?: string }) {


    const [selectImage, setSelectImage] = useState(url);

    const ref = useRef<HTMLCanvasElement>(null!);
    const offScreenRef = useRef<OffscreenCanvas>(null!);

    const refHandler = useCallback((element: HTMLCanvasElement) => {
        if (element && ref.current === null) {
            ref.current = element;
        }
    }, []);

    const workerRef = useRef<Worker>(null!);
    const img = useImageLoad(url);
    const [progressState, setProgressState] = useState({
        state: ProgressState.INIT,
        progress: 0
    })


    const onMessageHandler = useMemo(() => {

        return ({ data }: MessageEvent<OffScreenWorkerResponseParams>) => {
            const { state, progress } = data;
            if (state === WORKER_MESSAGE.WORK_PROGRESS_BEFORE) {
                setProgressState(prev => setter(prev, ProgressState.INIT, progress));
            } else if (state === WORKER_MESSAGE.WORK_PROGRESS_ING) {
                //setProgressState(prev => setter(prev, ProgressState.PROGRESS, progress));
            } else if (state === WORKER_MESSAGE.WORK_PROGRESS_COMPLETE) {
                setProgressState(prev => setter(prev, ProgressState.COMPLETE, progress));
            }
        }
    }, [])

    const updateCanvasSize = useCallback(() => {
        const cw = ref.current.parentElement!.clientWidth;
        const ch = ref.current.parentElement!.clientHeight;
        if (Number(ref.current.style.width) !== cw || Number(ref.current.style.height) !== ch) {
            ref.current.style.width = `${cw}px`;
            ref.current.style.height = `${ch}px`;
        }
        return { width: cw, height: ch };
    }, []);



    /* useEffect(() => {
        if (img) {
            const tempScreen = new OffscreenCanvas(img.width, img.height);
            const offCtx = tempScreen.getContext('2d', { willReadFrequently: true })!;
            const { width, height } = img;
            offCtx.drawImage(img, 0, 0);
            const imgData = offCtx.getImageData(0, 0, width, height);
            const grayData = toLinearGrayColor(imgData);
            workerRef.current.postMessage({
                colorWeights: grayData.invert,
                imgData: imgData.data.buffer,
                width,
                height,
                pointNum: (width * height) / (4),
                iteration: 40,
                state: WORKER_MESSAGE.IMAGE_CHANGE
            }, [imgData.data.buffer]);
            sync();
        }
    }, [img]);
    */


    const sync = useMemo(() => {
        return deBounce(() => {
            workerRef.current.postMessage({
                state: WORKER_MESSAGE.SYNC,
                stage: updateCanvasSize(),
                devicePixelRatio
            });
        }, 300);
    }, []);



    //useResizeHandler(sync);

    // useParallaxHeader(ref.current ? ref.current.parentElement! : ref.current);
    /* 
        useEffect(() => {
    
            const changeImage = () => {
                setSelectImage(sampleImage.options[Math.floor(randomFloat(sampleImage.options.length))]);
            }
    
            let intervalID = setInterval(changeImage, 10 * 1000);
    
            return () => {
                clearInterval(intervalID);
            }
    
        }, []); */

    useIsomorphicEffect(() => {
        workerRef.current = new Worker(new URL('./offScreenWorker', import.meta.url));
        workerRef.current.onmessage = onMessageHandler;
        workerRef.current.onerror = (e: ErrorEvent) => {
            console.log('e', e);
        };

        /* 
         strictMode와 transferControlToOffscreen 충돌방지 처리를 위해 초기는 offScreen에 참조를 설정하고
         이후 호출에서 postMessage로 초기설정 */

        if (process.env.STORY_BOOK) {
            offScreenRef.current = ref.current.transferControlToOffscreen();
            workerRef.current.postMessage({
                state: WORKER_MESSAGE.INITIALIZE,
                canvas: offScreenRef.current,
                devicePixelRatio
            }, [offScreenRef.current]);
        } else {
            if (offScreenRef.current) {
                workerRef.current.postMessage({
                    state: WORKER_MESSAGE.INITIALIZE,
                    canvas: offScreenRef.current,
                    devicePixelRatio
                }, [offScreenRef.current]);
            } else {
                offScreenRef.current = ref.current.transferControlToOffscreen();
            }

        }

        return () => {
            workerRef.current.terminate();
        }
    }, [onMessageHandler]);

    // url변경 시 worker에 알리고 워커에서 이미지를 로드해 관련 정보를 설정한다.
    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({
                state: WORKER_MESSAGE.IMAGE_CHANGE,
                url,
                stage: updateCanvasSize(),
                devicePixelRatio
            });
        }
    }, [url]);


    useResizeHandler(sync);

    return (
        <div className={ classNames('relative bg-inherit aspect-video', className) }>
            <canvas className="absolute transition-all duration-75 ease-out" ref={ refHandler }></canvas>
            <article className="absolute flex w-full h-full justify-center items-center">
                <CircleProgress progress={ progressState.state } progressSize={ 0.2 } color="#ffffff" />
            </article>
            { children }
        </div>
    )
}


export default OffScreenVisual;