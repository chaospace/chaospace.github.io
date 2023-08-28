import { useRef } from "react";


function useInitialized() {

    const inited = useRef<boolean>(false);

    if (!inited.current) {
        inited.current = true;
        return false;
    }

    return inited.current;
}


export default useInitialized;