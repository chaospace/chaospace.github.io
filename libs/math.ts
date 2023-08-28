import { PointLike } from "@/types";
import { randomFloat, range, spreadFloat } from "./utils";

class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    div(n: number) {
        return new Vector(this.x / n, this.y / n);
    }

    sub(v: Vector) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    subFrom(v: Vector) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    add(v: Vector) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    addTo(v: Vector) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    setAngle(rad: number) {
        let len = this.getLength();
        this.x = Math.cos(rad) * len;
        this.y = Math.sin(rad) * len;
        return this;
    }

    getLength() {
        return Math.hypot(this.x, this.y);
    }

    getLengthSq() {
        return this.x ** 2 + this.y ** 2;
    }

    setLength(len: number) {
        const angle = this.getAngle();
        this.x = Math.cos(angle) * len;
        this.y = Math.sin(angle) * len;
        return this;
    }

    distanceTo(v: Vector) {
        return this.sub(v).getLength();
    }

}

const getGridPosition = (pos: PointLike, size: number) => {
    return { x: Math.floor(pos.x / size), y: Math.floor(pos.y / size) };
}
const getGridIndex = (pos: PointLike, w: number) => {
    return (pos.y * w + pos.x);
}



const poissonDiscSampling = (boundingArea: { width: number, height: number }, r: number) => {

    const { width, height } = boundingArea;
    const radius = Math.floor(r / Math.SQRT2);
    const gridColsRows = new Vector(Math.floor(width / radius), Math.floor(height / radius));
    const total = gridColsRows.x * gridColsRows.y;
    const grids: Vector[] = Array.from({ length: total });
    const active: Vector[] = [];

    return {
        *generator(begin: Vector, tryCount: number, repeatCount: number) {
            active.push(begin);
            grids[getGridIndex(getGridPosition(begin, radius), gridColsRows.x)] = begin;
            while (active.length) {
                yield* this.search(tryCount, repeatCount);
            }

            return;

        },
        *search(nums = 30, repeat = 30) {
            let ordered: Vector[] = [];
            for (let n = 0; n < nums; n++) {
                if (active.length) {

                    const rIndex = ~~randomFloat(active.length);
                    const pos = active[rIndex];
                    let found = false;

                    for (let k = 0; k < repeat; k++) {
                        // 추가 포인트 위치설정
                        const sample = new Vector(range(1), range(1));
                        const m = spreadFloat(radius * 2, radius * 3);
                        sample.setLength(m);
                        sample.addTo(pos);
                        //추가포인트 그리드 인덱스 참조설정
                        const tempGridPos = getGridPosition(sample, radius);
                        const tempGridIndex = getGridIndex(tempGridPos, gridColsRows.x);
                        // 추가 포인트가 유효하면
                        if (
                            tempGridPos.x > -1 &&
                            tempGridPos.y > -1 &&
                            tempGridPos.x < gridColsRows.x &&
                            tempGridPos.y < gridColsRows.y &&
                            !grids[tempGridIndex]
                        ) {
                            let ok = true;
                            for (let j = -1; j <= 1; j++) {
                                for (let i = -1; i <= 1; i++) {
                                    const tempIndex = getGridIndex({ x: tempGridPos.x + i, y: tempGridPos.y + j }, gridColsRows.x);
                                    let neighbor = grids[tempIndex];
                                    if (neighbor) {
                                        let d = sample.distanceTo(neighbor);
                                        if (d < radius) {
                                            ok = false;
                                        }
                                    }
                                }
                            }

                            if (ok) {
                                found = true;
                                grids[tempGridIndex] = sample;
                                active.push(sample);
                                ordered.push(sample);
                                break;
                            }
                        }
                    }

                    if (!found) {
                        active.splice(rIndex, 1);
                    }

                }

            }

            yield { positions: ordered.concat(), radius };
        }
    }

}


export {
    Vector,
    getGridPosition,
    getGridIndex,
    poissonDiscSampling
}