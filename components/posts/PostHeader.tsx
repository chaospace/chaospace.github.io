import { PostFrontMatter } from "@/types";
import DateUI from "./DateUI";
import HLine from "../elements/HLine";


function PostHeader({ frontmatter }: { frontmatter: PostFrontMatter }) {

    return (
        <article>
            <h1 className="font-bold text-3xl">{ frontmatter.title }</h1>
            <p className="my-1">{ frontmatter.summary }</p>
            <DateUI date={ frontmatter.date } readTime={ frontmatter.readTime } />
            <HLine className="my-10" />
        </article>
    )
}


export default PostHeader;