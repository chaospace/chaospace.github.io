import { PREFERS_COLOR } from "@/const";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

function useNextTheme() {

    const [mounted, setMount] = useState(false);
    const { theme, setTheme } = useTheme();

    const isDark = theme === PREFERS_COLOR.DARK;
    const toggle = useCallback(() => {
        setTheme(isDark ? PREFERS_COLOR.LIGHT : PREFERS_COLOR.DARK);
    }, [isDark]);

    useEffect(() => {
        setMount(true);
    }, []);

    return { isDark, mounted, toggle, setTheme };

}

export default useNextTheme;