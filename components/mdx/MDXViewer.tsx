"use client"

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { PrismCode, CustomLink, TocInline } from "@/components/mdx/mdx-components";
import { useMemo } from "react";
import { MDXComponents } from "mdx/types";
import { TocHeading } from "@/types";

function MDXViewer(props: MDXRemoteSerializeResult & { toc: TocHeading[] }) {
    const components = useMemo(() => {
        return {
            a: CustomLink,
            pre: PrismCode,
            TocInline
        } as MDXComponents
    }, []);

    return (
        <MDXRemote { ...props } components={ components } lazy />
    )
}

export default MDXViewer;