import { ImageWorkerResult, OffScreenWorkerRequestParams } from "../../types";
import { randomFloat } from "../../libs/utils";
import { Delaunay } from "d3-delaunay";
import { WORKER_MESSAGE } from "@/const";
import { getPolygonCentroid, setLinearImageData } from "@/libs/canvasHelper";

let abortController: AbortController = new AbortController();
let taskState = '';
let generator: any = null;

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
    private _store: Map<string, any>;
    private _devicePixelRatio: number;
    private _stage: Area;
    private _image: { width: number, height: number, data: Uint8ClampedArray };

    private _points: Float32Array;
    private _colorWeights: Float32Array;
    private _iteration: number;
    private _animate: { reqID: number | undefined, pending: boolean, abort: boolean } = { reqID: undefined!, pending: false, abort: false };

    pendingGenerator = false;
    constructor() {
        this._store = new Map();
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

    set stage(stage: Area) {
        this._stage = stage;
    }

    get stage() {
        return this._stage;
    }

    set colorWeights(info: Float32Array) {
        this._colorWeights = info;
    }

    get colorWeights() {
        return this._colorWeights;
    }

    set points(info: Float32Array) {
        this._points = info;
    }

    get points() {
        return this._points;
    }

    set iteration(num: number) {
        this._iteration = num;
    }

    get iteration() {
        return this._iteration;
    }



    get animate() {
        return this._animate;
    }


    getImageInfo() {
        return this._image;
    }

    setCanvasSize(w: number, h: number) {
        this.canvas.width = w;
        this.canvas.height = h;
    }

    addItem(key: string, value: any) {
        this._store.set(key, value);
    }

    getItem(key: string) {
        if (!this._store.has(key)) {
            //throw new Error(`해당 ${key}에 저장된 데이터가 없습니다.`);
            return null;
        }
        return this._store.get(key);
    }

    setImageInfo({ data, width, height }: { data: Uint8ClampedArray, width: number, height: number }) {

        this._image = { data, width, height };
    }

    sizeSync(stage: Area, pixelRatio: number) {
        if (this._canvas) {
            this._devicePixelRatio = pixelRatio;
            const ratio = Math.max(stage.width / this._image.width, stage.height / this._image.height);
            const scale = ratio * pixelRatio;
            const { width, height } = this._image;

            this._canvas.width = stage.width * this._devicePixelRatio;
            this._canvas.height = stage.height * this._devicePixelRatio;
            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
            const cWidth = width;
            const cHeight = height;
            const x = (this.context.canvas.width - cWidth * scale) >> 1;
            const y = (this.context.canvas.height - cHeight * scale) >> 1;
            this.context.translate(x, y);
            this.context.scale(scale, scale);
        }
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
}


function* calculateGenerator(points: Float32Array, width: number, height: number, colorWeights: Float32Array, iteration: number) {

    const pointNum = sharedInstance.points.length / 2;
    const weights = new Float32Array(pointNum);
    const weightedCoordinates = new Float32Array(pointNum * 2);

    const delaunay = new Delaunay(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    let minWeight = Number.POSITIVE_INFINITY;
    let maxWeight = 0;
    sharedInstance.pendingGenerator = true;
    loop: for (let iter = 0; iter < iteration; iter++) {

        if (!sharedInstance.pendingGenerator) {
            break loop;
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
            console.log('progress', iter + 1);
            postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_ING, progress: (iter + 1) / iteration });
            yield { points, weights, skip: true }
        }
    }

    //postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_COMPLETE, progress: 1 });
    yield { points, weights, skip: false };
    postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_COMPLETE, progress: 1 });


}


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

}




const isSame = (prev: Float32Array, current: Float32Array) => {
    if (prev.length !== current.length) {
        return false;
    }
    return JSON.stringify(prev) === JSON.stringify(current);
}

const draw = (ctx: OffscreenCanvasRenderingContext2D, points: Float32Array, weights: Float32Array) => {

    // 2씩 증가시키며 포인트 위치를 파악.
    const { width, data } = sharedInstance.getImageInfo();
    const delaunay = new Delaunay(points);

    ctx.save();
    for (let polygons of delaunay.trianglePolygons()) {
        ctx.beginPath();
        ctx.moveTo(polygons[0][0], polygons[0][1]);
        const [cx, cy] = getPolygonCentroid(polygons);
        const idx = (Math.floor(cy) * width + Math.floor(cx)) * 4;
        const color = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
        for (let i = 1; i < polygons.length; i++) {
            ctx.lineTo(polygons[i][0], polygons[i][1]);
        }
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();

    /* for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        const w = weights[i >> 1];
        if (w) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.arc(x, y, Math.sqrt(w / 20), 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    } */

}

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

const animateWithFPS = (ctx: OffscreenCanvasRenderingContext2D, points: Float32Array, weights: Float32Array, start = 0, frame = 4) => {
    let lastCall: number | undefined = undefined;
    const fps = 1000 / frame;
    let done = false;
    let len = start;

    const animate = () => {
        const current = performance.now();
        if (lastCall == undefined || current - lastCall >= fps) {
            lastCall = current;
            len = (len << 1 < points.length) ? len << 1 : points.length;
            draw(ctx, points.slice(0, len), weights);
            // drawFrame(ctx);
            done = (len === points.length);
        }

        if (sharedInstance.animate.reqID) {
            sharedInstance.animate.reqID = requestAnimationFrame(animate);
        }
        if (done) {
            sharedInstance.animate.reqID = undefined!;
            sharedInstance.animate.pending = false;
        }
    }
    return requestAnimationFrame(animate);
}

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


const taskRunner = (gen: Generator, delay = 100) => {
    let reqID;
    const next = () => {
        let result = gen.next() as IteratorResult<ImageWorkerResult>;
        if (!result.done) {
            const { points, weights, skip } = result.value;
            if (sharedInstance.animate.abort) {
                clearTimeout(reqID!);
                cancelAnimationFrame(sharedInstance.animate.reqID!);
                sharedInstance.animate.reqID = undefined;
                sharedInstance.animate.abort = false;
                sharedInstance.animate.pending = false;
                gen.return(null);
                return;
            }
            if (!skip && points && weights) {
                sharedInstance.animate.reqID = animateWithFPS(sharedInstance.context, points, weights, 1);
            }
            reqID = setTimeout(next, delay);
        }
    }
    next();
}


const drawWork = () => {
    const points = sharedInstance.points;
    const { width, height } = sharedInstance.getImageInfo();
    generator = calculateGenerator(points, width, height, sharedInstance.colorWeights, sharedInstance.iteration);
    taskRunner(generator, 0);
    //sharedInstance.pendingGenerator = false;
    /* 
    taskState = 'pending';
    calculate(points, width, height, sharedInstance.colorWeights, sharedInstance.iteration, abortController.signal)
        .then(value => {
            taskState = '';
            sharedInstance.animate.reqID = animateWithFPS(sharedInstance.context, value.points, value.weights, 1);
        }).catch(e => {
            taskState = '';
            console.log('cancel-error', e);
        }); 
    */

};

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


const drawTemp = () => {
    const { width, height } = sharedInstance.getImageInfo();
    sharedInstance.colorWeights;
    const imageData = new ImageData(width, height);
    const context = sharedInstance.context;
    setLinearImageData(imageData.data, sharedInstance.colorWeights);
    const temp = new OffscreenCanvas(width, height);
    temp.getContext('2d')!.putImageData(imageData, 0, 0);
    context.save();
    context.globalAlpha = .5;
    context.drawImage(temp, 0, 0);
    context.restore();
}

self.onmessage = ({ data }: MessageEvent<OffScreenWorkerRequestParams>) => {

    const { state } = data;
    // console.log('메시지 수신', state);
    if (state === WORKER_MESSAGE.INITIALIZE && !sharedInstance.canvas && data.canvas) {
        sharedInstance.canvas = data.canvas;
    } else if (state === WORKER_MESSAGE.IMAGE_CHANGE) {
        if (sharedInstance.animate.pending) {
            //이전에 진행되는 작업이 있음.
            console.log('펜딩상태 작업 최소 요청');
            sharedInstance.animate.abort = true;
        }
        setDrawParamWork(data);
        sharedInstance.animate.pending = true;
    } else if (state === WORKER_MESSAGE.SYNC) {
        sharedInstance.sizeSync(data.stage, data.devicePixelRatio);
        drawTemp();
        postMessage({ state: WORKER_MESSAGE.WORK_PROGRESS_BEFORE, progress: 0 });
        drawWork();
    }

}

