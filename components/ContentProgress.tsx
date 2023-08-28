

import { motion } from "framer-motion";

function ContentProgress({ progress = 0 }: { progress: number }) {

    return (
        <motion.div className="absolute bottom-px z-10 bg-pink-500 left-0 h-px w-full" style={ { scaleX: progress } }></motion.div>
    )
}

export default ContentProgress;