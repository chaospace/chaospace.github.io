"use client";

import classNames from "classnames";
import { motion } from "framer-motion";
import { useKBar } from "kbar";


const firstLine = {
    hover: { y: -1, },
    close: { y: 0 },
}


const endLine = {
    hover: { y: 1 },
    close: { y: 0 }
}

function MenuToggle({ className }: { className?: string }) {

    const { query } = useKBar();



    return (
        <motion.button initial="close" whileHover={ 'hover' } className={ classNames("relative flex flex-col p-2 gap-1 w-8 h-8 items-center justify-center bg-white bg-opacity-40 rounded shadow", className) } onClick={ query.toggle }>
            <motion.span variants={ firstLine } className="h-[2px] w-full bg-black dark:bg-white rounded" />
            <span className="h-[2px] w-full  rounded bg-black dark:bg-white" />
            <motion.span variants={ endLine } className="h-[2px] w-full bg-black dark:bg-white rounded " />
        </motion.button>
    )

}


export default MenuToggle;