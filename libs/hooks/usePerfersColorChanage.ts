import { PREFERS_COLOR } from "@/const";
import { useEffect } from "react"



function usePerfersColorChanage(themeHandler: (mode: string) => void) {
    useEffect(() => {
        const handler = ({ matches: isDark }: MediaQueryListEvent) => {
            themeHandler(isDark ? PREFERS_COLOR.DARK : PREFERS_COLOR.LIGHT);
        }
        //system테마 변경감지 이벤트
        window.
            matchMedia(("(prefers-color-scheme: dark)"))
            .addEventListener('change', handler);

        return () => {
            window.matchMedia(("(prefers-color-scheme: dark)"))
                .removeEventListener('change', handler);
        }
    }, []);

}


export default usePerfersColorChanage;
