"use client";

import { PostFrontMatter } from "@/types";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import useScrollValue from "@/libs/hooks/useScrollValue";
import PostList from "./PostList";
import { usePathname } from "next/navigation";


/**
 * infinite scroll을 이용한 블로그 목록 컴포넌트
 * @param param0 
 * @returns 
 */
function DynamicPostList({ posts, currentPage = 1, totalPages = 1, itemPerPage = 3 }: { posts: PostFrontMatter[], currentPage?: number, totalPages?: number, itemPerPage?: number }) {

    const pathname = usePathname();
    const lastItemRef = useRef<HTMLDivElement>(null!);
    //중첩폴더가 없는 현재구조에서는 마지막 패스경로로 prefix을 판단.
    const prefix = pathname.split('/').filter(v => !!v).pop();

    const [searchWord, setSearchWord] = useState('');
    const [page, setPage] = useState(currentPage);

    const displayPost = useMemo(() => {
        const w = searchWord.toLowerCase();
        return w === ""
            ? posts.slice(0, page * itemPerPage)
            : posts.filter((post) => {
                const content = post.summary.toLocaleLowerCase() + post.title.toLocaleLowerCase() + post.tags?.join('').toLowerCase();
                return content.includes(w);
            })

    }, [posts, searchWord, page, totalPages, itemPerPage]);

    useEffect(() => {
        const io = new IntersectionObserver((entries, _) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setPage(current => {
                        console.log('current', current);
                        if (current + 1 <= totalPages) {
                            return current + 1;
                        }
                        return current;
                    })
                }
            })
        });
        if (lastItemRef.current) {
            io.observe(lastItemRef.current);
        }
        () => {
            if (lastItemRef.current) {
                io.unobserve(lastItemRef.current);
            }
        }
    }, [totalPages]);

    return (
        <>
            <div className='relative'>
                <input className='w-full !rounded' type="search"
                    aria-label="포스트 검색"
                    name="search_input"
                    placeholder='검색어를 넣어주세요...'
                    value={ searchWord }
                    onChange={ (event: ChangeEvent<HTMLInputElement>) => setSearchWord(event.target.value) } />
            </div>
            <div className="my-10">
                {
                    displayPost.length === 0
                        ? <p className="font-bold text-2xl">검색결과가 없습니다.</p>
                        : (
                            <PostList posts={ displayPost } prefix={ prefix }>
                                <div ref={ lastItemRef } className="h-4 bg-transparent"></div>
                            </PostList>
                        )
                }
            </div>
        </>
    )

}


export default DynamicPostList;