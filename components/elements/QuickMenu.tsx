'use client';

import useScrollValue from "@/libs/hooks/useScrollValue";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowUpLong, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useMemo } from "react";


function MenuItem({ icon, onClick }: { icon: IconProp, onClick: () => void }) {
    return (
        <button className="flex items-center justify-center  rounded-full w-10 h-10 border border-gray-400 border-opacity-20 bg-gray-200 dark:bg-gray-800" onClick={ onClick }>
            <FontAwesomeIcon icon={ icon } />
        </button>
    )
}


function QuickMenu() {

    const { y: scrollY } = useScrollValue();
    const router = useRouter();

    const isShow = useMemo(() => {
        return scrollY >= 200
    }, [scrollY]);


    return (
        <aside className={ classNames('fixed right-5 bottom-20 flex flex-col gap-4', { 'hidden': !isShow }) }>
            <MenuItem icon={ faHome } onClick={ () => {
                router.push('/');
            } } />
            <MenuItem icon={ faArrowUpLong } onClick={ () => {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                })
            } } />
        </aside>
    )
}


export default QuickMenu;