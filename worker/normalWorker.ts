import { ImageWorkerParams, ImageWorkerResult } from "../types";
import { randomFloat, range } from "../libs/utils";
import { Delaunay } from "d3-delaunay";



const easing = (x: number) => {
    return 1 - (1 - x) * (1 - x);
}
const lerp = (current: number, value: number, rate: number) => {
    let t = easing(rate);
    return current * (1 - t) + (value) * t;
}

/**
 * pointNum만큼에 포인트 좌표를 만들어 반환
 * @param pointNum 생성 할 포인트 수
 * @param colorWeights 포인트 밀도를 결정하는 컬러 가중치 정보
 * @return points:Float32Array;
 */
const generatePoint = (pointNum: number, colorWeights: Float32Array, width: number, height: number) => {
    const output = new Float32Array(pointNum * 2);
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

function* calculate(data: ImageWorkerParams & { points: Float32Array }) {
    const { colorWeights, width, height, pointNum, iteration, points } = data;


    const weights = new Float32Array(pointNum);
    const weightedCoordinates = new Float32Array(pointNum * 2);


    const delaunay = new Delaunay(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);


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

        const e = Math.pow(iter + 1, -.9) * 8;
        for (let i = 0; i < pointNum; i++) {
            let x0 = points[i * 2];
            let y0 = points[i * 2 + 1];
            const w = weights[i];
            if (w) {
                x0 = lerp(x0, weightedCoordinates[i * 2] / w, .5214);
                y0 = lerp(y0, weightedCoordinates[i * 2 + 1] / w, .5214);
            }
            points[i * 2] = x0 + range(e);
            points[i * 2 + 1] = y0 + range(e);
        }

        voronoi.update();

        if (iter <= iteration) {
            yield { points, weights } as ImageWorkerResult;
        }

    }
    // yield { points, weights } as ImageWorkerResult;
    // close();
    return;

}


let prevGen: Generator | null = null;
let prevColorWeights: Float32Array | null = null;
let prevPoitns: Float32Array | null = null;
const isSame = (prev: Float32Array, current: Float32Array) => {
    if (prev.length !== current.length) {
        return false;
    }
    return JSON.stringify(prev) === JSON.stringify(current);
}

self.onmessage = ({ data }: MessageEvent<ImageWorkerParams>) => {

    if (prevGen !== null) {
        prevGen.return(null);
        prevGen = null;
    }

    const { pointNum, width, height, colorWeights } = data;
    let points = new Float32Array(pointNum * 2);
    let summedColorWeights = colorWeights;
    if (prevColorWeights && isSame(prevColorWeights, colorWeights)) {
        points = Float32Array.from(prevPoitns!);
    } else {
        points = generatePoint(pointNum, summedColorWeights, width, height);
    }

    prevColorWeights = colorWeights;
    prevPoitns = points;


    const iter = calculate({ ...data, points });
    prevGen = iter;

    let result = iter.next();

    while (!result.done) {
        postMessage(result.value);
        result = iter.next();
    }
}
