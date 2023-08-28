'use client';
import { PREFERS_COLOR } from "@/const";
import useNextTheme from "@/libs/hooks/useNextTheme";
import { useEffect, useRef } from "react";


function Giscus() {
    const ref = useRef<HTMLElement>(null!);
    const { isDark } = useNextTheme();
    const theme = isDark ? PREFERS_COLOR.DARK : PREFERS_COLOR.LIGHT;

    useEffect(() => {
        if (!ref.current || ref.current.hasChildNodes()) return;
        const scriptEle = document.createElement("script");
        scriptEle.src = 'https://giscus.app/client.js';
        scriptEle.crossOrigin = 'anonymous';
        scriptEle.dataset.loading = 'lazy';
        scriptEle.dataset.theme = theme;
        scriptEle.dataset.inputPosition = 'bottom';
        scriptEle.dataset.emitMetadata = '0';
        scriptEle.dataset.strict = '0';
        scriptEle.dataset.mapping = 'pathname';
        scriptEle.dataset.categoryId = 'DIC_kwDOKMOndM4CY6Ru';
        scriptEle.dataset.category = 'Announcements';
        scriptEle.dataset.repo = "chaospace/blog-comments";
        scriptEle.dataset.repoId = "R_kgDOKMOndA";
        scriptEle.dataset.reactionsEnabled = "1";
        scriptEle.dataset.lang = "ko";
        ref.current.appendChild(scriptEle);
    }, []);

    //테마 변경 시  메시지 전송.
    useEffect(() => {
        const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
        iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
    }, [theme]);


    return (
        <section ref={ ref } />
    )
}


export default Giscus;