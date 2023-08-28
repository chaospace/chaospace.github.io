'use client'
import { PostFrontMatter } from "@/types";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import Link from "next/link";
import DateUI from "./DateUI";
import TagUI from "./TagUI";
import { motion } from "framer-motion"


const postItemVariants = {
    from: {
        opacity: 0,
        x: -10
    },
    to: (delay = 0) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: (0.1 * delay),
        }
    })
}

/**
 * animation효과를 준 포스트 아이템
 * 
 */
function Post({ title, slug, date, tags, summary, readTime, prefix, index = 0 }: PostFrontMatter & { prefix: string, index: number }) {

    return (
        <motion.article
            custom={ index }
            variants={ postItemVariants }
            initial="from"
            animate="to"
            className="relative box-border
        border-image
        before:content-normal 
        before:absolute    
        before:box-border 
        before:bottom-0
        before:left-0
        before:w-0
        before:h-0
        before:border-l-transparent
        before:border-l-2
        before:border-b-transparent
        before:border-b-2
        before:invisible
        before:pointer-events-none
        
        after:absolute
        after:pointer-events-none
        after:top-0 
        after:right-0
        after:invisible
        after:content-normal
        after:w-0
        after:h-0
        after:border-r-transparent
        after:border-t-transparent
        after:border-r-2
        after:border-t-2
        after:rounded-tr-md

        hover:before:w-full
        hover:before:h-full
        hover:after:w-full 
        hover:after:h-full
        hover:before:visible
        hover:after:visible
        transition-transform
        duration-100
        transform-gpu
        select-none
        ease-out
        ">
            <div className="flex flex-col gap-1 p-4">
                <DateUI date={ date } readTime={ readTime } />
                <Link href={ `/${prefix}/${slug}` }>
                    <h3 className="font-bold truncate">{ title }</h3>
                </Link>
                { tags && <TagUI tags={ tags } /> }
                <p className="text-sm">
                    { summary }
                </p>
                <Link className="text-xs text-primary-500 subpixel-antialiased underline underline-offset-4" href={ `/${prefix}/${slug}` }>
                    read more <FontAwesomeIcon className="ml-1" icon={ faArrowRightLong } />
                </Link>
            </div>
        </motion.article>
    )
}

function PostList({ className, posts, prefix = '', children }: { className?: string, prefix?: string, posts: PostFrontMatter[], children?: React.ReactNode }) {


    return (
        //일단 sm 640이상에서 2단 그리드 구성
        <motion.div
            className={ classNames('grid grid-cols-1 auto-rows-auto gap-4', className) }
        >
            {
                posts.map((post, index) => <Post key={ post.slug } { ...post } prefix={ prefix } index={ index } />)
            }
            {
                children
            }
        </motion.div>
    )
}

export default PostList;