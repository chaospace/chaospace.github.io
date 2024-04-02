
import { getRecentPosts } from "@/api/posts";
import { H2 } from "@/components/elements/Headings";
import PostList from "@/components/posts/PostList";
import HLine from "@/components/elements/HLine";
import OffScreenVisual from "@/components/visual/OffScreenVisual";


async function getData() {
  const posts = await getRecentPosts('posts', 3);
  const snippets = await getRecentPosts('snippet', 3);
  const projects = await getRecentPosts('projects', 3);
  return {
    posts,
    snippets,
    projects
  }
}


async function Home() {
  const { posts, snippets, projects } = await getData();
  return (
    <>

      <OffScreenVisual className='w-full h-[40vh] -mt-14'>
      </OffScreenVisual >
      <div className="mx-auto max-w-7xl w-full px-5 sm:px-10 space-y-10 my-10">
        <div className="space-y-3">
          <H2>Latest Post</H2>
          <HLine />
        </div>
        <PostList className="lg:grid-cols-3" posts={ posts } prefix="posts" />
        <div className="space-y-3">
          <H2>Latest Snippet</H2>
          <HLine />
        </div>
        <PostList className="lg:grid-cols-3" posts={ snippets } prefix="snippet" />
        <div className="space-y-3">
          <H2>Latest Project</H2>
          <HLine />
        </div>
        <PostList className="lg:grid-cols-3" posts={ projects } prefix="projects" />
      </div>
    </>
  )
}


export default Home;