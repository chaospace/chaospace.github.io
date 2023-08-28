import { create } from "zustand";
import { createSideBarSlice, createPageState } from "./ui";
import type { SidebarState, PageState } from "./ui";





/* const useHydration = () => {
    const [hydrate, setHydrate] = useState(false);

    useEffect(() => {

        //수동처리를 원하면 아래 코드를 사용
        //const unsubHydrate = uesThemeStore.persist.onHydrate(()=>setHydrate(false));

        const unsubFinishHydration = useGlobalStore.persist.onHydrate(() => setHydrate(true));
        setHydrate(uesThemeStore.persist.hasHydrated());

        return () => {
            //unsubHydrate();
            unsubFinishHydration();
        }
    }, []);

    return hydrate;
} */
//순수 상태만 선언해 둬야 서버사이드에서도 자유롭게 사용이 가능.
//순수 상태값만 가지고 사용하는게 무슨 의미가 될까?

const useGlobalStore = create<SidebarState>()(
    (...a) => ({
        ...createSideBarSlice(...a)
        // ...createPageState(...a)
    })
);

const useSideBarActive = () => useGlobalStore(state => state.active);
const useSlideBarAction = () => useGlobalStore(state => state.setActive);
// const usePageTitle = () => useGlobalStore(state => state.title);
// const usePageTitleAction = () => useGlobalStore(state => state.setTitle);

const getGlobalState = () => useGlobalStore.getState();
const setGlobalState = () => useGlobalStore.setState;
export {
    useGlobalStore,
    getGlobalState,
    useSideBarActive,
    useSlideBarAction,
    setGlobalState
}
