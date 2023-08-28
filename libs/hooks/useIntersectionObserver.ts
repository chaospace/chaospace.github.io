import { useMemo } from "react";
import useIsomorphicEffect from "./useIsomorphicEffect";


function useIntersectionObserver(option: IntersectionObserverInit | undefined) {

    const instance = useMemo(() => {
        const io = new IntersectionObserver((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(o => {
                if (o.isIntersecting) {
                    observer.unobserve(o.target);
                }
            });
        }, option);
        return io;
    }, []);

    useIsomorphicEffect(() => {
        return () => {
            instance.disconnect();
        }
    }, [])

    return instance;
}


export default useIntersectionObserver;