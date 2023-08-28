import { getAllPostFrontMatters, getPostBySlug } from "@/api/posts";
import MDXViewer from "@/components/mdx/MDXViewer";
import PostViewer from "@/components/posts/PostViewer";
import TocList from "@/components/posts/TocList";
import { POST_EXTENSION } from "@/const";
import { PostFrontMatter } from "@/types";
import { Metadata } from "next";


export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
    const { slug } = params;
    const postTitle = slug.join('/');
    const posts = await getAllPostFrontMatters('snippet');
    const currentPost = posts.filter(p => p.slug === postTitle)[0];

    return {
        title: currentPost.title,
        keywords: currentPost?.tags
    }
}

export async function generateStaticParams() {
    const posts = await getAllPostFrontMatters('snippet');
    return posts.map(({ slug }) => ({ slug: slug.split('/') }));
}

export async function getData(slug: string[]) {
    const joinPath = slug.join('/');
    const result = await getPostBySlug('snippet', `${joinPath}.${POST_EXTENSION}`);
    return result[0] || undefined;
}


async function Post({ params }: { params: { slug: string[] } }) {
    const { slug } = params;
    const post = await getData(slug);
    return (
        <PostViewer post={ post } />
    )
}

export default Post;