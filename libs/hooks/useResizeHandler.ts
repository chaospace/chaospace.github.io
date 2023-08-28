import { useEffect } from "react";



function useResizeHandler(handler: (e?: Event) => void, initCall: boolean = false) {

    useEffect(() => {
        //initCall여부에 따라 핸들러 실행
        initCall && handler();
        window.addEventListener('resize', handler);

        return () => {
            window.addEventListener('resize', handler);
        }
    }, [handler]);

}


export default useResizeHandler;