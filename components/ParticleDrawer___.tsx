'use client'

import useCanvas from "@/libs/hooks/useCanvas";
import useImageLoad from "@/libs/hooks/useImageLoad";
import { getImageDataProps, range, spreadFloat } from "@/libs/utils";
import { PointLike } from "@/types";
import { useEffect, useMemo } from "react";




let offScreen: any;

const getAverageColor = (x: number, y: number, r: number, imageData: ImageData) => {
    const { data, width, height } = imageData;
    let sx = ~~Math.max(0, x - r);
    let sy = ~~Math.max(0, y - r);
    let ex = ~~Math.min(width, x + r);
    let ey = ~~Math.min(height, y + r);

    const colors: number[][] = [[], [], []];
    for (let j = sy; j < ey; j++) {
        for (let i = sx; i < ex; i++) {
            const idx = (j * width + i) * 4;
            colors[0].push(data[idx]);
            colors[1].push(data[idx + 1]);
            colors[2].push(data[idx + 2]);
        }
    }
    const a = colors[0].reduce((a, b) => a + b, 0) / colors[0].length;
    const g = colors[1].reduce((a, b) => a + b, 0) / colors[1].length;
    const b = colors[2].reduce((a, b) => a + b, 0) / colors[2].length;
    return `rgb(${a},${g},${b})`;
}


class Particle {
    x: number;
    y: number;
    speed: PointLike;
    origin: PointLike;
    edge: number;
    alive = true;
    age: number;
    startAge: number;
    constructor(position: PointLike) {
        this.x = position.x;
        this.y = position.y;
        this.edge = ~~spreadFloat(4, 16);
        this.speed = {
            x: 0,
            y: 0
        }
        this.startAge = ~~spreadFloat(1, 400);
        this.origin = { ...position };
        this.age = 0;
    }

    draw(ctx: CanvasRenderingContext2D, imageData: ImageData) {
        this.speed.x += range(.5);
        this.speed.y += range(.5);
        this.x += this.speed.x;
        this.y += this.speed.y;
        const diffx = this.x - this.origin.x;
        const diffy = this.y - this.origin.y;
        const distance = Math.sqrt(diffx ** 2 + diffy ** 2);
        const ratio = 1 - (distance / this.edge);
        const r = ratio * this.edge * .89;
        if (r > 0) {
            requestAnimationFrame(() => {
                this.draw(ctx, imageData);
            });
            ctx.beginPath();
            const color = getAverageColor(~~this.x, ~~this.y, r, imageData);
            ctx.arc(~~this.x, ~~this.y, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = `rgba(0,0,0,0.06)`;
            ctx.stroke();
            ctx.closePath();
        } else {
            this.alive = false;
        }
    }
}

class Emitter {

    _ratio: number;
    _ctx: CanvasRenderingContext2D;
    _total: number;
    _frame: number;
    _prticles: Particle[];
    constructor(ctx: CanvasRenderingContext2D, ratio: number) {
        this._ctx = ctx;
        this._ratio = ratio;
        this._prticles = [];
        this._total = Number.POSITIVE_INFINITY;
        this._frame = 0;
    }

    set total(n: number) {
        this._total = n;
    }

    get total() {
        return this._total;
    }
    // 대상에 파티클 추가
    emit() {
        // 애미메이션을 명령형으로 할 수 있을까?
    }
    // 그리기
    render() {

    }

}

const getPolygonCentroid = (t: number[][]) => {
    for (var n, e, r = -1, i = t.length, o = 0, a = 0, u = t[i - 1], c = 0; ++r < i;)
        n = u,
            u = t[r],
            c += e = n[0] * u[1] - u[0] * n[1],
            o += (n[0] + u[0]) * e,
            a += (n[1] + u[1]) * e;
    return [o / (c *= 3), a / c]
}

const getCellCentroid = (cell: number[][]) => {

    let x = cell[0][0];
    let y = cell[0][1];
    for (let i = 1; i < cell.length; i++) {
        x += cell[i][0];
        y += cell[i][1];
    }

    return [x / cell.length, y / cell.length];
}


function ParticleDrawer({ url, className }: { url: string, className: string }) {

    const { ctx, ref } = useCanvas();
    const img = useImageLoad(url);
    const { ratio, imageData } = useMemo(() => {
        let ratio = -1;
        let imageData = null;
        if (ctx && img) {
            const { aspectRatio, imageData: data } = getImageDataProps(img, ctx);
            ratio = aspectRatio;
            imageData = data;
            // const total = Math.round((img.width * img.height) * .1);
            // points = Array.from({ length: total }, () => (new Particle({ x: randomFloat(img.width), y: randomFloat(img.height) })));
            offScreen = new OffscreenCanvas(imageData.width, imageData.height);
            offScreen.getContext('2d')!.putImageData(imageData, 0, 0);
        }
        return { ratio, imageData }
    }, [img])



    useEffect(() => {
        if (ratio > -1 && imageData !== null) {
            const { width, height } = imageData;

            // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            // const obj = poissonDiscSampling({ width, height }, 8);
            // const gen = obj.generator(new Vector(width / 2, height / 2), 40, 30);






            //ctx.putImageData(imageData, 0, 0);


            // let edgePoints: Vector[] = [];
            // let radiusValue = 1;
            // let count = 1;
            // const repeat = () => {

            //     const { value, done } = gen.next();

            //     if (!done) {
            //         const { radius, positions } = value;
            //         radiusValue = radius;
            //         edgePoints = [...edgePoints, ...positions];

            //         for (let pos of positions) {
            //             ctx.save();
            //             ctx.beginPath();
            //             ctx.strokeStyle = `hsl(${count},100%,50%)`;
            //             ctx.arc(pos.x, pos.y, radius / 2, 0, Math.PI * 2);
            //             ctx.stroke();
            //             ctx.closePath();
            //             ctx.restore();
            //             count += 1;
            //         }
            //         requestAnimationFrame(repeat);
            //     } else {
            //         stippling(edgePoints);
            //     }
            // }
            // repeat();

            /*
            const stippling = (position: Float64Array) => {
                const delaunay = new Delaunay(position);//.from(postions.map(v => [v.x, v.y]));
                const voronoi = delaunay.voronoi([0, 0, width, height]);

                const centroid = new Float64Array(colorWeights.length * 2);
                const weights = new Float64Array(colorWeights.length);
                let frame = 0;
                let ps = position;//
                const search = () => {

                    centroid.fill(0);
                    weights.fill(0);

                    for (let y = 0, i = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const w = colorWeights[y * width + x];
                            i = delaunay.find(x + 0.5, y + 0.5, i);
                            weights[i] += w;
                            centroid[i * 2] += w * (x + 0.5);
                            centroid[i * 2 + 1] += w * (y + 0.5);
                        }
                    }
                    const e = Math.pow(frame + 1, -0.8) * 10;
                    for (let n = 0; n < ps.length; n++) {
                        const x0 = ps[n * 2];
                        const y0 = ps[n * 2 + 1];
                        const w = weights[n];
                        const x1 = w ? centroid[n * 2] / w : x0;
                        const y1 = w ? centroid[n * 2 + 1] / w : y0;
                        ps[n * 2] = x0 + (x1 - x0) * .4 + e * (Math.random() - .5);
                        ps[n * 2 + 1] = y0 + (y1 - y0) * .4 + e * (Math.random() - .5);;
                    }
                    voronoi.update();

                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.save();
                    ctx.translate((ctx.canvas.width - (width * ratio)) * .5, (ctx.canvas.height - (height * ratio)) * .5);
                    ctx.scale(ratio, ratio);

                    for (let cell of voronoi.cellPolygons()) {
                        const [cx, cy] = getCellCentroid(cell);
                        const pIndex = (~~cy * width) + ~~cx;
                        const ratio = colorWeights[pIndex];
                        const colors = 'white';//`rgb(${imageData.data[pIndex * 4]}, ${imageData.data[pIndex * 4 + 1]}, ${imageData.data[pIndex * 4 + 2]})`;
                        ctx.beginPath();
                        ctx.arc(cx, cy,
                            (radiusValue * ratio) / 2, 0, Math.PI * 2);
                        ctx.fillStyle = colors;
                        ctx.fill();
                        ctx.closePath();
                    }
                    ctx.restore();

                    if (frame < edgePoints.length / 2) {
                        requestAnimationFrame(search);
                    }
                    frame++;

                }
                search();

            }
            */


            // let edgePoints = new Float64Array(2000 * 2);
            // let i = 0;
            // let radiusValue = 4;
            // while (i < edgePoints.length) {
            //     const x = ~~randomFloat(width);
            //     const y = ~~randomFloat(height);
            //     if (colorWeights[y * width + x] > .3) {
            //         edgePoints[i * 2] = x;
            //         edgePoints[i * 2 + 1] = y;
            //         i++;
            //     }
            // }
            //stippling(edgePoints);


            /*
           ctx.setTransform(1, 0, 0, 1, 0, 0);
           ctx.translate((ctx.canvas.width - (width * ratio)) * .5, (ctx.canvas.height - (height * ratio)) * .5);
           ctx.scale(ratio, ratio);
           let frame = 1;
           const straggleParticle = () => {
               const len = frame < points.length ? frame : points.length;
               for (let i = 0; i < len; i++) {
                   const p = points.shift();
                   ctx.save();
                   p?.draw(ctx, imageData);
                   ctx.restore();
               }
               frame++;
               if (points.length) {
                   requestAnimationFrame(() => straggleParticle());
               }

           }
           straggleParticle();
           */

        }
    }, [ratio, imageData]);

    return (
        <div className={ className }>
            <canvas ref={ ref }></canvas>
        </div>
    )
}



export default ParticleDrawer;