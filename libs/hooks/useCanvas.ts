import { useCallback, useRef } from "react";
import useForceUpdate from "./useForceUpdate";


function useCanvas() {

    const _canvasRef = useRef<CanvasRenderingContext2D>(null!);

    const forceUpdate = useForceUpdate();

    const ref = useCallback((node: HTMLCanvasElement) => {
        if (node && _canvasRef.current === null) {
            _canvasRef.current = node.getContext('2d', { willReadFrequently: true })!;
            forceUpdate();
        }
    }, []);


    return {
        ref,
        ctx: _canvasRef.current,
    }
}


export default useCanvas;