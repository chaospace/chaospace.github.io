import type { TFunc } from "@/types";


const pipe = <T extends TFunc[], R extends TFunc>(...fns: [...T, R]) => {
    return (args: any): ReturnType<R> => {
        return fns.reduce((current, fn) => fn(current), args);
    };
}


const curryMap = (fn: TFunc) => <T>(input: Array<T>) => input.map(fn);
const range = (v: number) => v * (Math.random() - .5);
const randomFloat = (v: number) => Math.random() * v;
const spreadFloat = (min: number, max: number) => min + (~~randomFloat(max + 1 - min));

const getImageDataProps = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
    const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
    const { width: imgWidth, height: imgHeight } = img;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    ctx.clearRect(0, 0, imgWidth, imgHeight);
    return { img, imageData };
}



const deBounce = (callback: (...args: any[]) => any, timeout = 100) => {
    let callbackID: NodeJS.Timeout | undefined;
    return (...args: any[]): ReturnType<typeof callback> => {
        if (callbackID) {
            clearTimeout(callbackID);
        }
        callbackID = setTimeout(() => {
            clearTimeout(callbackID);
            callbackID = undefined;
            callback(...args);
        }, timeout);
    }

}

export {
    pipe,
    randomFloat,
    spreadFloat,
    curryMap,
    range,
    getImageDataProps,
    deBounce
}
