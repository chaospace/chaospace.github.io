'use client';

import useScrollValue from "@/libs/hooks/useScrollValue";
import colors from "tailwindcss/colors"
import classNames from "classnames";
import { useRef } from "react";
import MenuToggle from "./MenuToggle";
import ThemeToggleButton from "./ThemeToggleButton";
import { usePathname } from "next/navigation";
import ContentProgress from "../ContentProgress";
import GradientSpace from "../elements/GradientSpace";
import useIsomorphicEffect from "@/libs/hooks/useIsomorphicEffect";
import useNextTheme from "@/libs/hooks/useNextTheme";





function Header({ id, className }: { id?: string, className?: string, children?: React.ReactNode }) {
    const ref = useRef<HTMLElement>(null!);
    const titleRef = useRef<string>('');
    const { isDark } = useNextTheme();
    const { y: scrollY, progressY } = useScrollValue();

    const opacity = ~~(Math.min(1, Math.max(0, scrollY / ref.current?.clientHeight)) * 255);
    const hasLine = opacity >= 255;
    const bg = (isDark ? colors.gray[900] : colors.gray[50]) + (opacity >= 16 ? opacity.toString(16) : `0` + opacity.toString(16));
    const pathname = usePathname();
    const isMain = pathname === "/";

    useIsomorphicEffect(() => {
        titleRef.current = document.querySelector('title')?.textContent?.split('|')[0] || '';
    }, [pathname]);

    return (
        <>
            <header ref={ ref } id={ id } className={ className }>
                <div suppressHydrationWarning className={ classNames(`relative
                                flex
                                text-center
                                items-center
                                justify-between
                                gap-2
                                px-5
                                sm:px-8
                                w-full
                                h-14
                                border-b 
                                border-b-gray-200 
                                dark:border-b-gray-800`, { 'border-b-0': isMain ? true : !hasLine }) } style={ {
                        backgroundColor: bg
                    } } >
                    { !isMain && <ContentProgress progress={ progressY } /> }
                    <MenuToggle />
                    { !isMain && hasLine &&
                        <h1 className="truncate font-bold">{ titleRef.current }</h1>
                    }
                    <ThemeToggleButton className='w-8 h-8 p-1 items-center justify-center bg-white bg-opacity-40 rounded shadow  text-black dark:text-white' />
                </div>
                { !isMain && <GradientSpace /> }
            </header>
        </>
    )
}

export default Header;