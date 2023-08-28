"use client";
import useIsomorphicEffect from "@/libs/hooks/useIsomorphicEffect";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { MouseEventHandler, forwardRef, useImperativeHandle, useState } from "react";


interface FullScreenImperativeHandle {
    toggle(ele: HTMLElement): void
}

const hasFullScreenElement = () => {
    return document.fullscreenElement !== null;
}

const FullScreenButton = forwardRef<FullScreenImperativeHandle, { className?: string, onClick?: MouseEventHandler<HTMLButtonElement>, state?: boolean }>(({ className, state = false, onClick }, ref) => {

    const [isFullScreen, setFullScreen] = useState(state);

    useIsomorphicEffect(() => {
        setFullScreen(state);
    }, [state]);

    useImperativeHandle(ref, () => {
        return {
            toggle: (ele: HTMLElement) => {
                if (document.fullscreenEnabled) {
                    if (hasFullScreenElement()) {
                        document.exitFullscreen();
                        setFullScreen(false);
                    } else {
                        ele.requestFullscreen();
                        setFullScreen(true);
                    }
                } else {
                    alert('풀스크린 기능을 지원하지 않습니다!');
                }
            }
        }
    }, []);

    return (
        <button className={ classNames("p-1 w-5 h-5", className) } onClick={ onClick }>
            <span className="sr-only">toggle fullscreen</span>
            { isFullScreen ? <FontAwesomeIcon icon={ faCompress } /> : <FontAwesomeIcon icon={ faExpand } /> }
        </button>
    )
});

export type { FullScreenImperativeHandle };
export default FullScreenButton;