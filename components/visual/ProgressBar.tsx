import { ProgressState } from "@/const";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";



function ProgressBar({ state, progress }: { progress: number, state: ProgressState }) {

    const ref = useRef<HTMLSpanElement>(null!);
    useEffect(() => {
        let elementRef = ref.current;
        // console.log('progerss', progress);
        switch (state) {
            case ProgressState.INIT:
                gsap.set(elementRef, { transformOrigin: "0% 50%", scaleX: 0, autoAlpha: 1 });
                break;
            case ProgressState.PROGRESS:
                gsap.to(elementRef, { scaleX: progress, duration: 0.25, ease: 'ease-out' });
                break;
            case ProgressState.COMPLETE:
                gsap.to(elementRef, { scaleX: 1, duration: 0.6, ease: 'ease-out' });
                gsap.to(elementRef, { delay: 0.4, autoAlpha: 0, duration: 0.8, ease: 'ease-out' });
                break;
        }

        return () => {
            gsap.killTweensOf(elementRef);
        }
    }, [state, progress]);

    return <span ref={ ref } className="progress-bar absolute h-[2px] w-full bg-gray-500"></span>
}


export { ProgressState };
export default ProgressBar;