import { ImageWorkerResult, OffScreenWorkerRequestParams } from "../../types";
import { randomFloat } from "../../libs/utils";
import { Delaunay } from "d3-delaunay";
import { WORKER_MESSAGE } from "@/const";
import { getPolygonCentroid, setLinearImageData, toLinearGrayColor } from "@/libs/canvasHelper";
import { gsap } from "gsap";

let abortController: AbortController | null = null;
let gsapContext = gsap.context(() => { });
type Area = {
    width: number,
    height: number
}

const easing = (x: number) => {
    return 1 - (1 - x) * (1 - x);
}
const lerp = (current: number, value: number, rate: number) => {
    let t = easing(rate);
    return current * (1 - t) + (value) * t;
}


class SharedInstance {

    static _instance: SharedInstance | null = null;
    private _canvas: OffscreenCanvas;

    private _devicePixelRatio: number;

    constructor() {

    }

    set canvas(canvas: OffscreenCanvas) {
        this._canvas = canvas;
    }

    get canvas() {
        return this._canvas;
    }

    get context() {
        return this._canvas.getContext('2d', { willReadFrequently: true })!;
    }

    set devicePixelRatio(pixelRatio: number) {
        this._devicePixelRatio = pixelRatio;
    }

    get devicePixelRatio() {
        return this._devicePixelRatio;
    }



    sizeSync(stage: Area, image: ImageProps) {
        if (this._canvas) {
            // gsapContext.kill(false);
            const { width, height } = image;
            const pixelRatio = this._devicePixelRatio;
            const ratio = Math.max(stage.width / width, stage.height / height);
            const scale = ratio * pixelRatio;
            //스케일 변경 전 현재화면 캡쳐
            this.context.save();
            this.context.resetTransform();
            const backup = new OffscreenCanvas(this._canvas.width, this._canvas.height);
            const backupCtx = backup.getContext('2d')!;
            backupCtx.drawImage(this.context.canvas, 0, 0);
            this.context.restore();

            this._canvas.width = stage.width * pixelRatio;
            this._canvas.height = stage.height * pixelRatio;
            //이전 화면 롤백
            this.context.drawImage(backup, 0, 0);

            const cWidth = image.cWidth = width * scale;
            const cHeight = image.cHeight = height * scale;
            const x = image.cx = (this.context.canvas.width - cWidth) >> 1;
            const y = image.cy = (this.context.canvas.height - cHeight) >> 1;

            this.context.translate(x, y);
            this.context.scale(scale, scale);

        }
    }

    clear() {
        this.context.save();
        this.context.fillStyle = 'white';
        this.context.beginPath();
        this.context.rect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fill();
        this.context.closePath();
        this.context.restore();
    }

    static getInstance() {
        if (SharedInstance._instance === null) {
            SharedInstance._instance = new SharedInstance();
        }
        return SharedInstance._instance;
    }
}

const sharedInstance = SharedInstance.getInstance();



/**
 * pointNum만큼에 포인트 좌표를 만들어 반환
 * @param pointNum 생성 할 포인트 수
 * @param colorWeights 포인트 밀도를 결정하는 컬러 가중치 정보
 * @return points:Float32Array;
 */
const generatePoint = (pointNum: number, colorWeights: Float32Array, width: number, height: number) => {
    const output = new Float32Array(pointNum * 2);
    //효과 바운더리 설정
    for (let i = 0; i < pointNum; i++) {
        let x = 0;
        let y = 0;
        for (let j = 0, rejected = true; j < 100 && rejected; j++) {
            x = Math.floor(randomFloat(width));
            y = Math.floor(randomFloat(height));
            let val = colorWeights[y * width + x];
            //
            rejected = Math.random() > val ** 2;
        }
        output[i * 2] = x;
        output[i * 2 + 1] = y;
    }
    return output;
}


/* 
function calculate<T extends ImageWorkerResult>(points: Float32Array, width: number, height: number, colorWeights: Float32Array, iteration: number, signal: AbortSignal): Promise<T> {
    const cancelError = new Error('cancel-abort');

    return new Promise((resolve, reject) => {

        const abortHandler = () => {
            console.log('이전취소!!', reject);
            reject(cancelError);
        }

        signal.addEventListener('abort', abortHandler);
        const pointNum = sharedInstance.points.length / 2;
        const weights = new Float32Array(pointNum);
        const weightedCoordinates = new Float32Array(pointNum * 2);

        const delaunay = new Delaunay(points);
        const voronoi = delaunay.voronoi([0, 0, width, height]);

        let minWeight = Number.POSITIVE_INFINITY;
        let maxWeight = 0;
        for (let iter = 0; iter < iteration; iter++) {

            if (signal.aborted) {
                reject(cancelError);
                return;
            }

            weights.fill(0);
            weightedCoordinates.fill(0);

            for (let y = 0, idx = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    idx = delaunay.find(x + .5, y + .5, idx);
                    const w = colorWeights[y * width + x];
                    if (w) {
                        weights[idx] += w;
                        weightedCoordinates[idx * 2] += w * (x + .5);
                        weightedCoordinates[idx * 2 + 1] += w * (y + .5);
                    }
                }
            }

            const e = Math.pow(iter + 1, -.9) * 8;

            for (let i = 0; i < pointNum; i++) {
                let x0 = points[i * 2];
                let y0 = points[i * 2 + 1];
                const w = weights[i];
                if (w) {
                    if (w < minWeight) minWeight = w;
                    if (w > maxWeight) maxWeight = w;
                    x0 = lerp(x0, weightedCoordinates[i * 2] / w, .5214);
                    y0 = lerp(y0, weightedCoordinates[i * 2 + 1] / w, .5214);
                }
                points[i * 2] = x0;
                points[i * 2 + 1] = y0;
            }

            voronoi.update();
            if (iter + 1 <= iteration) {
                postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_ING, progress: (iter + 1) / iteration });
            }
        }

        resolve({ points, weights } as T);
        signal.removeEventListener('abort', abortHandler);

    });
} */


function* calculateGenerator(points: Float32Array, width: number, height: number, colorWeights: Float32Array, iteration: number) {

    const pointNum = points.length / 2;
    const weights = new Float32Array(pointNum);
    const weightedCoordinates = new Float32Array(pointNum * 2);

    const delaunay = new Delaunay(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    let minWeight = Number.POSITIVE_INFINITY;
    let maxWeight = 0;

    loop: for (let iter = 0; iter < iteration; iter++) {

        weights.fill(0);
        weightedCoordinates.fill(0);

        for (let y = 0, idx = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                idx = delaunay.find(x + .5, y + .5, idx);
                const w = colorWeights[y * width + x];
                if (w) {
                    weights[idx] += w;
                    weightedCoordinates[idx * 2] += w * (x + .5);
                    weightedCoordinates[idx * 2 + 1] += w * (y + .5);
                }
            }
        }

        const e = Math.pow(iter + 1, -.9) * 8;

        for (let i = 0; i < pointNum; i++) {
            let x0 = points[i * 2];
            let y0 = points[i * 2 + 1];
            const w = weights[i];
            if (w) {
                if (w < minWeight) minWeight = w;
                if (w > maxWeight) maxWeight = w;
                x0 = lerp(x0, weightedCoordinates[i * 2] / w, .5214);
                y0 = lerp(y0, weightedCoordinates[i * 2 + 1] / w, .5214);
            }
            points[i * 2] = x0;
            points[i * 2 + 1] = y0;
        }

        voronoi.update();
        if (iter + 1 <= iteration) {
            postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_ING, progress: (iter + 1) / iteration });
            yield { points, weights, skip: true }
        }
    }

    yield { points, weights, skip: false };
    postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_COMPLETE, progress: 1 });


}

/* 
function* calculateDot(points: Float32Array, width: number, height: number, colorWeights: Float32Array, iteration: number) {

    const pointNum = sharedInstance.points.length / 2;
    const weights = new Float32Array(pointNum);
    const weightedCoordinates = new Float32Array(pointNum * 2);

    const delaunay = new Delaunay(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    let minWeight = Number.POSITIVE_INFINITY;
    let maxWeight = 0;
    for (let iter = 0; iter < iteration; iter++) {

        weights.fill(0);
        weightedCoordinates.fill(0);

        for (let y = 0, idx = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                idx = delaunay.find(x + .5, y + .5, idx);
                const w = colorWeights[y * width + x];
                if (w) {
                    weights[idx] += w;
                    weightedCoordinates[idx * 2] += w * (x + .5);
                    weightedCoordinates[idx * 2 + 1] += w * (y + .5);
                }
            }
        }

        // const e = Math.pow(iter + 1, -.9) * 8;

        for (let i = 0; i < pointNum; i++) {
            let x0 = points[i * 2];
            let y0 = points[i * 2 + 1];
            const w = weights[i];
            if (w) {
                if (w < minWeight) minWeight = w;
                if (w > maxWeight) maxWeight = w;
                x0 = lerp(x0, weightedCoordinates[i * 2] / w, .5214);
                y0 = lerp(y0, weightedCoordinates[i * 2 + 1] / w, .5214);
            }
            points[i * 2] = x0;// + range(e);
            points[i * 2 + 1] = y0;// + range(e);
        }

        voronoi.update();

        if (iter <= iteration) {
            yield { points, weights };
        }

    }

    return;

} */




const isSame = (prev: Float32Array, current: Float32Array) => {
    if (prev.length !== current.length) {
        return false;
    }
    return JSON.stringify(prev) === JSON.stringify(current);
}




const draw = (ctx: OffscreenCanvasRenderingContext2D, points: Float32Array, weights: Float32Array, { image, points: origin }: DrawTask) => {

    // 2씩 증가시키며 포인트 위치를 파악.
    const { width, height, imgData: data } = image!;//;sharedInstance.getImageInfo();
    const delaunay = new Delaunay(points);
    const opacity = Math.max(0.1, points.length / origin.length);
    ctx.save();
    ctx.globalAlpha = opacity;
    for (let polygons of delaunay.trianglePolygons()) {
        ctx.beginPath();
        ctx.moveTo(polygons[0][0], polygons[0][1]);
        const [cx, cy] = getPolygonCentroid(polygons);
        const idx = (Math.floor(cy) * width + Math.floor(cx)) * 4;
        //, ${opacity}
        const color = `rgb(${data.data[idx]},${data.data[idx + 1]},${data.data[idx + 2]})`;
        for (let i = 1; i < polygons.length; i++) {
            ctx.lineTo(polygons[i][0], polygons[i][1]);
        }
        ctx.fillStyle = color;
        // ctx.strokeStyle = color;
        // ctx.lineWidth = 1;
        ctx.fill();
        // ctx.stroke();
    }
    /* ctx.restore();
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        const w = weights[i >> 1];
        if (w) {
            ctx.beginPath();
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.arc(x, y, Math.sqrt(w / 4), 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    }
    ctx.restore(); */
}
/* 
// 외곽라인 블러링 처리
const drawFrame = (ctx: OffscreenCanvasRenderingContext2D) => {
    const { width, height } = sharedInstance.getImageInfo();
    const edgeFeather = new OffscreenCanvas(width, height);
    const edgeContext = edgeFeather.getContext('2d')!;
    const feather = 2;
    const drawArea = feather;
    //그림자만 보이게 offset을 조절
    edgeContext.save();
    edgeContext.translate(-width, 0);
    edgeContext.shadowOffsetX = width;
    edgeContext.shadowOffsetY = 0;
    edgeContext.shadowColor = '#000';
    edgeContext.shadowBlur = feather;
    edgeContext.beginPath();
    //- drawArea * 2
    //- drawArea * 2
    edgeContext.rect(drawArea, drawArea, width - drawArea * 2, height - drawArea * 2);
    edgeContext.closePath();
    edgeContext.fill();
    edgeContext.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';

    ctx.drawImage(edgeFeather, 0, 0, width, height);
    ctx.restore();

}
 */
const animateWithFPS = (ctx: OffscreenCanvasRenderingContext2D, points: Float32Array, weights: Float32Array, start = 0, taskInfo: DrawTask, frame = 10) => {
    let lastCall: number | undefined = undefined;
    const fps = 1000 / frame;
    let done = false;
    let len = start;

    const animate = () => {
        const current = performance.now();
        if (lastCall == undefined || current - lastCall >= fps) {
            lastCall = current;
            len = (len << 1 < points.length) ? len << 1 : points.length;
            draw(ctx, points.slice(0, len), weights, taskInfo);
            // drawFrame(ctx);
            done = (len === points.length);
        }

        if (!taskInfo.abort && !done) {
            taskInfo.animateID = requestAnimationFrame(animate);
        }
        if (done) {
            taskInfo.abort = true;
        }
    }
    return requestAnimationFrame(animate);
}
/* 
const drawDot = (data: any) => {
    if (data && data.points) {
        const context = sharedInstance.context;
        const { points, weights } = data;
        const { width, height } = sharedInstance.getImageInfo();
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);
        context.save();
        for (let i = 0; i < points.length; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            const w = weights[i >> 1];
            if (w > .5) {
                context.beginPath();
                context.fillStyle = 'white';
                context.arc(x, y, Math.sqrt(w / 4), 0, Math.PI * 2);
                context.fill();
                context.closePath();
            }
        }
        context.restore();
    }


}




const setDrawParamWork = (data: OffScreenWorkerRequestParams) => {
    const { pointNum, width, height, colorWeights, iteration, imgData } = data;
    let points = new Float32Array(pointNum * 2);
    const prevColorWeights = sharedInstance.colorWeights
    const prevPoints = sharedInstance.points
    if (prevColorWeights && isSame(prevColorWeights, colorWeights)) {
        points = Float32Array.from(prevPoints);
    } else {
        points = generatePoint(pointNum, colorWeights, width, height);
    }
    //이전 정보 기억
    sharedInstance.colorWeights = colorWeights;
    sharedInstance.points = points;
    sharedInstance.iteration = iteration;
    sharedInstance.setImageInfo({ data: new Uint8ClampedArray(imgData), width, height });
}
 */

interface ImageProps {
    width: number;
    height: number;
    scale: number;
    cx: number;
    cy: number;
    cWidth: number;
    cHeight: number;
    imgData: ImageData;
    view: OffscreenCanvas;
}

interface DrawProps {
    points: Float32Array;
    iteration: number;
    colorWeights: Float32Array;
    image?: ImageProps;
}

interface TaskProps {
    id: NodeJS.Timeout | null;
    animateID: number | null;
    abort: boolean;
    // pending: boolean;
    generator: Generator | null;
}

interface DrawTask extends TaskProps, DrawProps { };

const startTask = (task: DrawTask) => {
    drawTemp(task);

    task.generator = calculateGenerator(task.points, task.image!.width, task.image!.height, task.colorWeights, task.iteration);

    const next = () => {
        let result = task.generator!.next() as IteratorResult<ImageWorkerResult>;
        if (!result.done) {
            const { points, weights, skip } = result.value;
            if (!skip && points && weights) {
                //포인트 갱신
                task.points = Float32Array.from(points);
                saveCompleteImage(task);
                task.animateID = animateWithFPS(sharedInstance.context, points, weights, 1, task);
            }
            task.id = setTimeout(next, 0);
        }
    }
    next();
};

/* 
const drawDotWork = () => {

    const points = sharedInstance.points;
    const { width, height } = sharedInstance.getImageInfo();
    const iter = calculateDot(points, width, height, sharedInstance.colorWeights, sharedInstance.iteration);

    const goLoop = () => {
        let result = iter.next();
        drawDot(result.value);
        if (!result.done) {
            setTimeout(() => {
                goLoop();
            }, 50);
        }
    }
    goLoop();
}
 */

const drawTemp = (task: DrawTask, opacity = 1) => {
    const { view } = task.image!;
    const context = sharedInstance.context;
    const step = 30;
    let v = opacity / step;

    //현재이미지를 일단 캡쳐.
    context.save();
    context.globalAlpha = opacity / step;
    let tw = { opacity: 0 };
    gsapContext.kill(false);
    gsapContext.add(() => {
        gsap.to(tw, {
            duration: .6,
            opacity,
            ease: `steps(${step})`,
            onStart: () => {

            },
            onUpdate: () => {
                //console.log('update-', v);
                context.globalAlpha = tw.opacity;
                context.drawImage(view, 0, 0);

            },
            onComplete: () => {
                context.restore();
            }
        });
    })



}

const saveCompleteImage = (task: DrawTask) => {
    const { width, imgData } = task.image!;
    const delaunay = new Delaunay(task.points);
    const ctx = task.image!.view.getContext('2d', { willReadFrequently: true })!;
    for (let polygons of delaunay.trianglePolygons()) {
        ctx.beginPath();
        ctx.moveTo(polygons[0][0], polygons[0][1]);
        const [cx, cy] = getPolygonCentroid(polygons);
        const idx = (Math.floor(cy) * width + Math.floor(cx)) * 4;
        const color = `rgb(${imgData.data[idx]},${imgData.data[idx + 1]},${imgData.data[idx + 2]})`;
        for (let i = 1; i < polygons.length; i++) {
            ctx.lineTo(polygons[i][0], polygons[i][1]);
        }
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    }
}


const createDrawAbleImage = (source: ImageData, inputSource: Float32Array) => {
    const image = new OffscreenCanvas(source.width, source.height);
    const tempData = new ImageData(Uint8ClampedArray.from(source.data), source.width, source.height);
    setLinearImageData(tempData.data, inputSource);
    image.getContext('2d')!.putImageData(tempData, 0, 0);
    return image;
}

const createImageData = (source: ImageData, inputSource: Float32Array) => {
    const tempData = new ImageData(Uint8ClampedArray.from(source.data), source.width, source.height);
    setLinearImageData(tempData.data, inputSource);
    return tempData;
}

const setViewImageData = (image: ImageProps, inputSource: Float32Array) => {
    const { view, imgData } = image;
    view.getContext('2d')!.putImageData(createImageData(imgData, inputSource), 0, 0);
}



const createTask = async <T extends DrawTask>({ url, stage }: OffScreenWorkerRequestParams): Promise<T> => {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    abortController = new AbortController();
    try {
        const response = await fetch(url, { signal: abortController.signal });
        const fileBlob = await response.blob();
        const bitmap = await createImageBitmap(fileBlob);
        const imageProps = await createImageParams(bitmap) as ImageProps;
        const { width, height, imgData } = imageProps;
        const pointNum = (width * height) / (4);
        const grayData = toLinearGrayColor(imgData);
        setViewImageData(imageProps, grayData.invert);
        const iteration = 80;
        const points = generatePoint(pointNum, grayData.invert, width, height);
        sharedInstance.sizeSync(stage, imageProps);
        return {
            id: null,
            animateID: null,
            generator: null,
            abort: false,
            colorWeights: grayData.invert,
            iteration,
            points,
            image: imageProps
        } as T;
    } catch (e: any) {
        throw e;
    } finally {
        abortController = null;
    }

}

const createImageParams = async (bitmap: ImageBitmap) => {

    const { width, height } = bitmap;
    const temp = new OffscreenCanvas(width, height);
    const ctx = temp.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(bitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, width, height);
    return {
        width,
        height,
        view: temp,
        imgData,
        cx: 0,
        cy: 0,
        scale: 1,
        cWidth: width,
        cHeight: height
    }
}


let workTaks: DrawTask[] = [];
const reDraw = (task: DrawTask) => {
    // prevTask
    const hasTask = workTaks.includes(task);
    //이전 작업은 모두 제거
    while (workTaks.length && !hasTask) {
        let oldTask = workTaks.shift()!;
        if (oldTask === task) {
            continue;
        }

        oldTask.abort = true;
        clearTimeout(oldTask.id!);
        cancelAnimationFrame(oldTask.animateID!);
        oldTask.generator!.return(null!);
    }
    if (!hasTask) {
        workTaks.push(task);
        postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_BEFORE, progress: 0 });
        // sharedInstance.clear();
        startTask(task);
    } else if (task.abort) {
        // 현재화면 캡쳐!; 애니메이션 완료 후 원본에 적용한 이미지 캡쳐가 필요.
        drawTemp(task);
    }
}


self.onmessage = ({ data }: MessageEvent<OffScreenWorkerRequestParams>) => {

    const { state } = data;
    // console.log('메시지 수신', state);
    if (state === WORKER_MESSAGE.INITIALIZE && !sharedInstance.canvas && data.canvas) {
        sharedInstance.canvas = data.canvas;
        sharedInstance.devicePixelRatio = data.devicePixelRatio;
    } else if (state === WORKER_MESSAGE.IMAGE_CHANGE) {
        createTask(data).then(reDraw).catch(e => {
            console.log('요청실패!!', e);
        })
    } else if (state === WORKER_MESSAGE.SYNC) {
        //sharedInstance.sizeSync(data.stage, data.devicePixelRatio);
        if (workTaks.length) {
            const currentTask = workTaks[workTaks.length - 1];
            sharedInstance.sizeSync(data.stage, currentTask.image!);
            reDraw(currentTask);
        }
    }

}

