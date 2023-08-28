import { StateCreator } from "zustand";

type SidebarState = {
    active: boolean,
    sidebarWidth: number,
    setActive: (bValue: boolean) => void;
}

const createSideBarSlice: StateCreator<SidebarState, [], [], SidebarState> = (set) => ({
    active: false,
    sidebarWidth: 240,
    setActive: (bValue) => set({ active: bValue })
});

type PageState = {
    title: string;
    setTitle: (strValue: string) => void;
}

const createPageState: StateCreator<PageState, [], [], PageState> = (set) => ({
    title: '',
    setTitle: (strValue: string) => set({ title: strValue })
});

export type { SidebarState, PageState }
export { createSideBarSlice, createPageState };
