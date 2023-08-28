'use client';

import { HTMLAttributes, PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { getGlobalState, useSideBarActive } from "@/store";

const variants = {
    normal: {
        x: 0,
        borderLeftWidth: '0'
    },
    active: {
        x: getGlobalState().sidebarWidth,
        borderLeftWidth: '1px'
    },
}

const transitionProps = {
    ease: 'easeOut',
    duration: .2
}

function ContentBodyWrapper({ children, id, className }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
    const active = useSideBarActive();
    return (
        <motion.main initial="normal" animate={ active ? 'active' : 'normal' } id={ id } className={ className } transition={ transitionProps } variants={ variants } >
            { children }
        </motion.main>
    )
}


export default ContentBodyWrapper;