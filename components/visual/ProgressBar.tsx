import { ProgressState } from "@/const";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";



function ProgressBar({ state, progress }: { progress: number, state: ProgressState }) {

    const ref = useRef<HTMLSpanElement>(null!);
    useEffect(() => {
        // console.log('progerss', progress);
        switch (state) {
            case ProgressState.INIT:
                gsap.set(ref.current, { transformOrigin: "0% 50%", scaleX: 0, autoAlpha: 1 });
                break;
            case ProgressState.PROGRESS:
                gsap.to(ref.current, { scaleX: progress, duration: 0.25, ease: 'ease-out' });
                break;
            case ProgressState.COMPLETE:
                gsap.to(ref.current, { scaleX: 1, duration: 0.6, ease: 'ease-out' });
                gsap.to(ref.current, { delay: 0.4, autoAlpha: 0, duration: 0.8, ease: 'ease-out' });
                break;
        }

        return () => {
            gsap.killTweensOf(ref.current);
        }
    }, [state, progress]);

    return <span ref={ ref } className="progress-bar absolute h-[2px] w-full bg-gray-500"></span>
}


export { ProgressState };
export default ProgressBar;