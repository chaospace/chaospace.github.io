'use client';
import { MouseEvent, useMemo } from "react";

function AnchorButton({ children, anchor }: { children: React.ReactNode, anchor: string }) {

    const clickHandler = useMemo(() => {
        return (e: MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const ele = document.querySelector(anchor);
            ele?.scrollIntoView();
        }
    }, [anchor]);


    return (
        <a className="cursor-pointer" data-anchor={ anchor } onClick={ clickHandler }>
            { children }
        </a>
    )

}

export default AnchorButton;