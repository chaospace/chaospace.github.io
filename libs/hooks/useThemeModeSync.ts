import { PREFERS_COLOR } from "@/const";
import { THEME_MODE } from "@/types";
import { useEffect } from "react";


function useThemeModeSync(currentMode: THEME_MODE, extraHandler?: (theme: string) => void) {
    useEffect(() => {
        if (document.documentElement.dataset.theme !== currentMode) {
            document.documentElement.dataset.theme = currentMode;
            //이전 상태는 제거
            currentMode === PREFERS_COLOR.DARK ? document.documentElement.classList.add(currentMode) : document.documentElement.classList.remove(PREFERS_COLOR.DARK);
            extraHandler && extraHandler(currentMode);
        }
    }, [currentMode]);
}

export default useThemeModeSync;