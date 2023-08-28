"use client";
import { useRef, useState, PropsWithChildren } from "react";
import Link, { LinkProps } from "next/link";
import { TocHeading } from "@/types";

function PrismCode(props: any) {
    const textInput = useRef<HTMLDivElement>(null!);
    const [hovered, setHovered] = useState(false)
    const [copied, setCopied] = useState(false)
    const onEnter = () => {
        setHovered(true)
    }
    const onExit = () => {
        setHovered(false)
        setCopied(false)
    }
    const onCopy = () => {
        setCopied(true)
        navigator.clipboard.writeText(textInput.current.textContent!)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <div ref={ textInput } onMouseEnter={ onEnter } onMouseLeave={ onExit } className="relative">
            { hovered && (
                <button
                    aria-label="Copy code"
                    type="button"
                    className={ `absolute right-2 top-2 h-8 w-8 rounded border-2 bg-gray-700 p-1 dark:bg-gray-800 ${copied
                        ? 'border-green-400 focus:border-green-400 focus:outline-none'
                        : 'border-gray-300'
                        }` }
                    onClick={ onCopy }
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        fill="none"
                        className={ copied ? 'text-green-400' : 'text-gray-300' }
                    >
                        { copied ? (
                            <>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={ 2 }
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                            </>
                        ) : (
                            <>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={ 2 }
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </>
                        ) }
                    </svg>
                </button>
            ) }

            <pre>{ props.children }</pre>
        </div>
    )
}



function CustomLink({ href = '', ...rest }: PropsWithChildren<LinkProps>) {
    const isInternal = href && href.toString().startsWith('/');
    const isAnchor = href && href.toString().startsWith('#');

    if (isInternal) {
        return <Link href={ href }><a { ...rest } /></Link>
    } else if (isAnchor) {
        return <a href={ href.toString() } { ...rest } />
    }
    return <a href={ href.toString() } rel="noopener noreferrer" target="_blank" { ...rest } />
}


function TocInline({
    toc = [],
    indentDepth = 3,
    fromHeading = 1,
    toHeading = 6,
    asDisclosure = false,
    exclude = ''
}: { toc: TocHeading[], indentDepth?: number, fromHeading?: number, toHeading?: number, asDisclosure?: boolean, exclude?: string }) {

    const re = Array.isArray(exclude) ? new RegExp('^(' + exclude.join('|') + ')$', 'i') : new RegExp('^(' + exclude + ')$', 'i');
    const filterdToc = toc.filter((heading: TocHeading) => heading.depth >= fromHeading && heading.depth <= toHeading && !re.test(heading.value))

    const tocList = (
        <ul>
            {
                filterdToc.map(heading => (
                    <li key={ heading.value } className={ `${heading.depth >= indentDepth && 'ml-6'}` }>
                        <a href={ heading.url }>{ heading.value }</a>
                    </li>
                )
                )
            }
        </ul>
    )

    return (
        <>
            { asDisclosure ? (
                <details open>
                    <summary className="ml-6 pt-2 text-xl font-bold">Table of Contents</summary>
                    <div className="ml-6">{ tocList }</div>
                </details>
            )
                :
                (tocList)
            }
        </>
    )
}


export {
    CustomLink,
    PrismCode,
    TocInline
};