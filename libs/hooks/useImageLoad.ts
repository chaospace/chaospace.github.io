import { useEffect, useState } from "react";



function useImageLoad(url: string) {
    const [img, setImage] = useState<HTMLImageElement>(null!);
    useEffect(() => {
        const temp = document.createElement('img');
        temp.onload = () => setImage(temp);
        temp.src = url;
    }, [url]);

    return img;
}

export default useImageLoad;