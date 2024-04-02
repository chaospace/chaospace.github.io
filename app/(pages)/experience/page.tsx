
import { getAllPostFrontMatters } from '@/api/posts';
import PageHeader from '@/components/PageHeader';
import DynamicPostList from '@/components/posts/DynamicPostList';


const itemPerPage = 5;

export const metadata = {
  title: '프로젝트 목록'
}

async function getData() {
  const posts = await getAllPostFrontMatters('experience');
  return {
    posts,
    currentPage: 1,
    totalPages: Math.ceil(posts.length / itemPerPage)
  }
}

async function Posts({ params }: { params: any }) {
  const { posts, currentPage, totalPages } = await getData();
  const title = `All Experience( ${posts.length} )`;

  return (
    <div className='p-10 min-h-screen'>
      <PageHeader className='mb-10' title={ title }>
        <p>개인 프로젝트 내용을 정리하는 공간</p>
      </PageHeader >
      <DynamicPostList posts={ posts } currentPage={ currentPage } totalPages={ totalPages } itemPerPage={ itemPerPage } />
    </div>
  )
}


export default Posts;