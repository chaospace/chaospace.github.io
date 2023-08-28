import { getAllPostFrontMatters } from "@/api/posts";
import LocationMenu from "@/components/elements/LocationMenu";
import PageHeader from "@/components/PageHeader";
import DynamicPostList from "@/components/posts/DynamicPostList";

const itemPerPage = 5;


export const metadata = {
    title: '코드조각 목록'
}

export async function getData() {
    const posts = await getAllPostFrontMatters('snippet');
    return {
        posts,
        currentPage: 1,
        totalPages: Math.ceil(posts.length / itemPerPage)
    }
}

async function SnippetPage() {
    const { posts, currentPage, totalPages } = await getData();
    const title = `All Snippet ( ${posts.length} )`;
    return (
        <div className="p-10 min-h-screen">
            {/* <LocationMenu /> */ }
            <PageHeader className='mb-10' title={ title }>
                <p>유틸성 코드를 정리하는 공간</p>
            </PageHeader >
            <DynamicPostList posts={ posts } currentPage={ currentPage } totalPages={ totalPages } itemPerPage={ itemPerPage } />
        </div>
    )
}


export default SnippetPage;