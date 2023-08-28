"use server";

import { cookies } from "next/dist/client/components/headers";

const setThemeCookie = (theme: string) => {
    const current = cookies().get('themeStore');
    if (!current) {
        cookies().set('themeStore', theme);
    } else if (current!.value !== theme) {
        cookies().set('themeStore', theme);
    }
}


export {
    setThemeCookie
}