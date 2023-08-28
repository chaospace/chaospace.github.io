import { useEffect } from "react";
import useScrollValue from "./useScrollValue";



function useParallaxHeader(element: HTMLElement) {

    const { y: scrollY } = useScrollValue();

    useEffect(() => {

        if (element) {
            const area = element.getBoundingClientRect();
            const childrenElement = element.children;
            const ratio = Math.min(1, scrollY / area.height);
            const diff = (ratio * area.height) >> 1;
            for (let i = 0; i < childrenElement.length; i++) {
                const element = childrenElement[i] as HTMLElement;
                if (!element.className.includes('progress-bar')) {
                    element.style.transform = `translateY(${Math.floor(diff)}px)`;
                }
                if (element.tagName.toUpperCase() === 'CANVAS') {
                    element.style.opacity = (1 - ratio).toString();
                }
            }
        }

    }, [element, scrollY]);


}

export default useParallaxHeader;