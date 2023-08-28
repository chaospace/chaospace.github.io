import { useRef, useState } from "react";
import useIsomorphicEffect from "./useIsomorphicEffect";
import { PointLike } from "@/types";
import { deBounce } from "../utils";

//scroll값은 알아서 잡는게 좋은거야 아니면 reactive가 일어나야 좋은거야?

type ScrollValueProps = {
    x: number,
    y: number,
    progressY: number;
    progressX: number;
}

function useScrollValue() {
    const [scrollPos, setScrollPos] = useState<ScrollValueProps>({ x: 0, y: 0, progressY: 0, progressX: 0 });
    useIsomorphicEffect(() => {
        const scrollHandler = deBounce((e: Event) => {
            const x = document.documentElement.scrollLeft;
            const y = document.documentElement.scrollTop;
            const dx = document.documentElement.scrollWidth - document.documentElement.clientWidth;
            const dy = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const progressX = dx > 0 ? x / dx : 0;
            const progressY = dy > 0 ? y / dy : 0;
            setScrollPos(() => ({
                x,
                y,
                progressX,
                progressY
            }));
        }, 10);
        //초기 스크롤 위치 동기화를 위한 호출!
        scrollHandler();
        window.addEventListener('scroll', scrollHandler);
        return () => {
            window.removeEventListener('scroll', scrollHandler);
        }
    }, []);

    return scrollPos;
}


export default useScrollValue;