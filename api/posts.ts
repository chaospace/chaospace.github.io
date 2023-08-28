import { readFileSync } from 'fs'
import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from 'remark-gfm';
import remarkCodeTitles from '@/libs/remark-code-titles';
import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
import rehypePrismPlus from "rehype-prism-plus";
import { clearMDXExtension, getContentPath, getFileList, joinPath } from '@/libs/files';
import { FrontMatter, PostFrontMatter, TocHeading } from '@/types';
import { POST_EXTENSION } from '@/const';
import { curryMap } from '@/libs/utils';
import remarkTocHeadings from '@/libs/remark-toc-headings';
import readingTime from 'reading-time';

const vaildateMDX = (file: string) => /\mdx$/.test(file);


type PostSerializeResult = {
    compiledSource: string,
    scope: any,
    frontmatter: FrontMatter
};

type PostProps = PostSerializeResult & {
    toc: TocHeading[]
}


async function readPostList(mdxList: string[]) {
    const posts: PostProps[] = [];
    mdxList.forEach(async (mdx) => {
        const source = readFileSync(mdx, 'utf-8');
        let toc: TocHeading[] = [];
        const mdxSource: PostSerializeResult = await serialize(source, {
            mdxOptions: {
                remarkPlugins: [
                    [remarkTocHeadings, { exportRef: toc }],
                    remarkGfm,
                    remarkCodeTitles
                ],
                rehypePlugins: [
                    rehypeSlug,
                    // [rehypeAutoLinkHeadings, {
                    //     properties: {
                    //         className: ['anchor']
                    //     }
                    // }],
                    [rehypePrismPlus, { ignoreMissing: true }]
                ],
                format: POST_EXTENSION
            },
            parseFrontmatter: true

        });

        const frontmatter = { ...mdxSource.frontmatter, readTime: getReadingTime(source) }
        /*
         mdx에서 동적 변수를 사용할 경우 scope에 적용해주면 mdx파일에서 동적으로 접근해 사용가능.
         ex ) my name is {name}
         => scope:{name:'chaospace'}
        */
        //console.log('read-time', readingTime(mdxSource.compiledSource));

        posts.push({ ...mdxSource, scope: { toc }, toc, frontmatter });
    });
    return posts;
}

const getSlug = (contentLocation: string) => (mdxPath: string) => {
    return clearMDXExtension(mdxPath.substring(contentLocation.length + 1));
}

const getPostFiles = (location: string) => {
    return getFileList(location).filter(vaildateMDX);
}

const sortOnDate = (posts: PostFrontMatter[]) => {
    return posts.sort((a: PostFrontMatter, b: PostFrontMatter) => {
        console.log('a', a.date, a.title, 'b', b.date, b.title);
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        if (aTime > bTime) {
            return -1;
        } else if (aTime < bTime) {
            return 1;
        }
        return 0;
    });
}

const getReadingTime = (content: string) => {
    return readingTime(content).minutes;
}

async function getAllPostFrontMatters(location: string) {
    const postLocation = getContentPath(location);
    const getPostSlug = getSlug(postLocation);
    const readPostFrontMatter = curryMap(async (mdxPath: string) => {
        const source = readFileSync(mdxPath, 'utf-8');
        const readTime = getReadingTime(source);
        const { frontmatter } = await serialize(source, { parseFrontmatter: true }) as PostSerializeResult;
        return { ...frontmatter, slug: getPostSlug(mdxPath), readTime };
    });
    const posts = await Promise.all<PostFrontMatter[]>(readPostFrontMatter(getPostFiles(postLocation)));

    return sortOnDate(posts);
}

async function getRecentPosts(location: string, count = 4) {
    const posts = await getAllPostFrontMatters(location);
    return posts.slice(0, count);
}


async function getPostBySlug(location: string, slug: string) {
    const s = getContentPath(location);
    const getFileLocatoinPath = joinPath(s);
    const currentPage = getPostFiles(s).filter(filePath => filePath === getFileLocatoinPath(slug));
    const posts = await readPostList(currentPage);
    return posts;
}


export type {
    PostProps
}

export {
    getAllPostFrontMatters,
    getPostBySlug,
    getRecentPosts
}