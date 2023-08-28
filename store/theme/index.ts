//상태관리용 스토어 zustand를 이용해 초기 테마적용

import { useEffect, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type State = {
    theme: string;
    setTheme: (mode: string) => void
}

//next 하이드레이션 처리를 위한 방법..
//https://docs.pmnd.rs/zustand/integrations/persisting-store-data
// 여러 컴포넌트 사용시 문제 있음.
// const useHydrateSelector = <T, F>(store: (selector: (state: T) => unknown) => unknown, selector: (state: T) => F) => {
//     const result = store(selector) as F;
//     const [data, setData] = useState<F>();
//     useEffect(() => {
//         setData(result);
//     }, [result]);

//     return data;
// }

const useHydration = () => {
    const [hydrate, setHydrate] = useState(false);

    useEffect(() => {

        //수동처리를 원하면 아래 코드를 사용
        //const unsubHydrate = uesThemeStore.persist.onHydrate(()=>setHydrate(false));

        const unsubFinishHydration = uesThemeStore.persist.onHydrate(() => setHydrate(true));
        setHydrate(uesThemeStore.persist.hasHydrated());

        return () => {
            //unsubHydrate();
            unsubFinishHydration();
        }
    }, []);

    return hydrate;
}


const uesThemeStore = create<State>()(devtools(persist((set, get) => ({
    theme: 'dark',
    setTheme: (mode: string) => set({ theme: mode }, false, 'setTheme')
}), {
    name: 'themeStore',
})));

const useTheme = () => uesThemeStore((state) => state.theme);
const useThemeAction = () => uesThemeStore((state) => state.setTheme);


export { uesThemeStore, useTheme, useThemeAction, useHydration };