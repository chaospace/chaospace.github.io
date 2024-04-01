'use client';

import useInitialized from "@/libs/hooks/useInitialized";
import useIsomorphicEffect from "@/libs/hooks/useIsomorphicEffect";
import { TocHeading } from "@/types";

function IntersectionOb({ toc }: { toc: TocHeading[] }) {

    useIsomorphicEffect(() => {

        let eleList: Element[] = Array.from(toc, () => null!);
        const targetList = new WeakMap<Element, HTMLAnchorElement>();
        const contentMargin = -100;
        console.log('eleList', eleList);
        const changeItem = (entries: IntersectionObserverEntry[], _: IntersectionObserver) => {
            entries.forEach(o => {
                const t = targetList.get(o.target);
                if (o.isIntersecting) {
                    t?.parentElement?.classList.remove('opacity-60');
                } else {

                    if (document.documentElement.clientHeight + contentMargin < o.boundingClientRect.y) {
                        t?.parentElement?.classList.add('opacity-60');
                    }
                }
            });
        }

        const io = new IntersectionObserver(changeItem, {
            rootMargin: `${contentMargin}px 0px ${contentMargin}px 0px`,
        });

        const registObserverTarget = () => {
            eleList = toc.map(v => document.querySelector(v.url)).filter(v => !!v) as Element[];

            if (toc.length === eleList.length) {
                //성공
                /* const scrollY = document.documentElement.scrollTop;
                for (let i = 1; i < eleList.length; i++) {
                    const { y, height } = eleList[i - 1].getBoundingClientRect();
                    let py = y + scrollY;
                    let cy = eleList[i].getBoundingClientRect().y + scrollY;
                    let h = (cy - py) - height;
                    areaList[i - 1] = { y: py, h, sum: py + h };
                    if (i === eleList.length - 1) {
                        h = document.querySelector('[data-content="post-area"]')!.clientHeight - cy;
                        areaList[i] = { y: cy, h, sum: cy + h };
                    }
                } */

                eleList.forEach((vo) => {
                    if (vo) {
                        targetList.set(vo, document.querySelector(`a[data-anchor="#${vo.id}"]`)!)
                        io.observe(vo);
                    }

                });


            } else {
                setTimeout(() => registObserverTarget(), 500);
            }
        }

        registObserverTarget();

        return () => {

            io.disconnect();

        }

    }, [toc]);


    return (null);
}

export default IntersectionOb;