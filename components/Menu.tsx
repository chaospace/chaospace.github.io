"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MenuProps } from "@/types";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
const MotionLink = motion(Link);

const transformOrign = {
    transformOrigin: '0 50%'
}
const labelVariants = {
    normal: {
        scale: 1
    },
    hover: {
        scale: 1.1
    }
}

const lineVariants = {
    normal: {
        scaleX: 0
    },
    hover: {
        scaleX: 1,
    }
}

function Menu({ link, label, icon, target, title }: MenuProps) {
    const pathname = usePathname();
    const isActive = useMemo(() => pathname === link, [pathname]);

    return (
        <MotionLink className="block ml-4 my-2 leading-none" title={ title || label } initial="normal" whileHover="hover" animate={ isActive && 'hover' || '' } href={ link } target={ target }  >
            <motion.div style={ transformOrign } variants={ labelVariants } className="flex items-center gap-4" >
                {/* <FontAwesomeIcon icon={ icon! } size="lg" /> */ }
                <span>{ label }</span>
            </motion.div>
            <motion.span style={ transformOrign } className="w-full h-px inline-block bg-red-400" variants={ lineVariants } />
        </MotionLink >
    );
}


export default Menu;