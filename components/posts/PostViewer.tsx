import { PostProps } from "@/api/posts";
import MDXViewer from "../mdx/MDXViewer";
import TocList from "./TocList";
import { PostFrontMatter } from "@/types";
import PostHeader from "./PostHeader";
import IntersectionOb from "./IntersectionOb";
import Giscus from "../comments/Giscus";

function PostViewer({ post }: { post: PostProps }) {
    const { toc, frontmatter } = post
    return (
        <>
            <PostHeader frontmatter={ frontmatter as PostFrontMatter } />
            <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-8">
                <div data-content="post-area" className="prose max-w-[796px] dark:prose-dark">
                    { post &&
                        <>
                            <MDXViewer { ...post } />
                            <Giscus />
                        </>
                    }
                </div>
                <TocList className="hidden lg:block" toc={ toc } />
                <IntersectionOb toc={ toc } />
            </div>
        </>
    )

}


export default PostViewer;