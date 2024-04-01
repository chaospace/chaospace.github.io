'use client';
import { TocHeading } from "@/types";
import { faCircleDot, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AnchorButton from "../elements/AnchorButton";


function TocList({ className, toc, exclude = 'TL:DR' }: { className?: string, toc: TocHeading[], exclude?: string }) {
    const hasToc = toc.length > 0;
    const rootDepth = hasToc && toc[0].depth;
    const tocList = exclude ? toc.filter(v => !exclude.includes(v.value)) : toc;

    return (
        hasToc &&
        <div className={ className }>
            <ul className="sticky top-28 rounded-lg text-gray-100 bg-gray-800 p-4 space-y-2">
                {
                    tocList?.map((vo, idx) => (
                        <li key={ `${vo.value}_${idx}` } className={ `flex items-center ml-${rootDepth === vo.depth ? 2 : 4} text-sm` }>
                            <FontAwesomeIcon icon={ rootDepth === vo.depth ? faCircleDot : faMinus } size={ rootDepth === vo.depth ? 'xs' : '2xs' } className="mr-2" />
                            <AnchorButton anchor={ vo.url }>
                                { vo.value }
                            </AnchorButton>
                        </li>
                    ))
                }
            </ul>
        </div>
    );

}


export default TocList;