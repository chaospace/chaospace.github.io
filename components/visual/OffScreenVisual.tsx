"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import useImageLoad from "@/libs/hooks/useImageLoad";
import { WORKER_MESSAGE } from "@/const";
import useResizeHandler from "@/libs/hooks/useResizeHandler";
import { deBounce } from "@/libs/utils";
import { OffScreenWorkerResponseParams } from "@/types";
import { ProgressState } from "./ProgressBar";
import classNames from "classnames";
import CircleProgress from "./CircleProgress";


const setter = (current: { progress: number, state: ProgressState }, state: ProgressState, progress: number) => {
    return current.state !== state ? { progress, state } : { ...current, progress };
}

function OffScreenVisual({ className, children, url = '/images/santorini.jpg' }: { className?: string, children?: React.ReactNode, url?: string }) {


    // const [selectImage, setSelectImage] = useState(url);

    const ref = useRef<HTMLCanvasElement>(null!);
    const offScreenRef = useRef<OffscreenCanvas>(null!);



    const workerRef = useRef<Worker>(null!);
    // const img = useImageLoad(url);
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
    }, []);

    const refHandler = useCallback((element: HTMLCanvasElement) => {
        if (element && offScreenRef.current === null) {
            ref.current = element;
            offScreenRef.current = element.transferControlToOffscreen();
            workerRef.current = new Worker(new URL('./offScreenWorker', import.meta.url));
            workerRef.current.onmessage = onMessageHandler;
            workerRef.current.onerror = (e: ErrorEvent) => {
                console.log('e', e);
            };
            workerRef.current.postMessage({
                state: WORKER_MESSAGE.INITIALIZE,
                canvas: offScreenRef.current,
                devicePixelRatio
            }, [offScreenRef.current]);
        }

    }, [onMessageHandler]);

    const updateCanvasSize = useCallback(() => {
        const cw = ref.current.parentElement!.clientWidth;
        const ch = ref.current.parentElement!.clientHeight;
        if (Number(ref.current.style.width) !== cw || Number(ref.current.style.height) !== ch) {
            ref.current.style.width = `${cw}px`;
            ref.current.style.height = `${ch}px`;
        }
        return { width: cw, height: ch };
    }, []);



    const sync = useMemo(() => {
        return deBounce(() => {
            workerRef.current.postMessage({
                state: WORKER_MESSAGE.SYNC,
                stage: updateCanvasSize(),
                devicePixelRatio
            });
        }, 300);
    }, [updateCanvasSize]);



    // useIsomorphicEffect(() => {
    //     console.log('import.meta.url', import.meta.url);
    //     workerRef.current = new Worker(new URL('./offScreenWorker', import.meta.url));
    //     workerRef.current.onmessage = onMessageHandler;
    //     workerRef.current.onerror = (e: ErrorEvent) => {
    //         console.log('e', e);
    //     };

    //     /* 
    //      strictMode와 transferControlToOffscreen 충돌방지 처리를 위해 초기는 offScreen에 참조를 설정하고
    //      이후 호출에서 postMessage로 초기설정 */
    //     // if (!offScreenRef.current && ref.current) {
    //     //     offScreenRef.current = ref.current.transferControlToOffscreen();
    //     // }
    //     if (offScreenRef.current) {
    //         workerRef.current.postMessage({
    //             state: WORKER_MESSAGE.INITIALIZE,
    //             canvas: offScreenRef.current,
    //             devicePixelRatio
    //         }, [offScreenRef.current]);
    //     }


    //     return () => {
    //         workerRef.current.terminate();
    //     }
    // }, [onMessageHandler]);

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
    }, [url, updateCanvasSize]);


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