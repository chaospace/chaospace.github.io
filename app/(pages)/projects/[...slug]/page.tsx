import { getAllPostFrontMatters, getPostBySlug } from "@/api/posts";
import { POST_EXTENSION } from "@/const";
import { Metadata } from "next";
import PostViewer from "@/components/posts/PostViewer";


export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {

    const { slug } = params;
    const postTitle = slug.join('/');
    const posts = await getAllPostFrontMatters("projects");
    const currentPost = posts.filter(p => p.slug === postTitle)[0];
    return {
        title: currentPost.title,
        keywords: currentPost?.tags
    }
}

export async function generateStaticParams() {
    const posts = await getAllPostFrontMatters('projects');
    return posts.map(({ slug }) => ({ slug: slug.split('/') }));
}

async function getData(slug: string[]) {
    const mergePath = slug.join('/');
    const result = await getPostBySlug('projects', `${mergePath}.${POST_EXTENSION}`);
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