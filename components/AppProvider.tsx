'use client';
import { PREFERS_COLOR } from "@/const";
import useNextTheme from "@/libs/hooks/useNextTheme";
import { ActionId, ActionImpl, KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarResults, KBarSearch, useMatches } from "kbar"

import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { Fragment, forwardRef, useMemo } from "react";
import classNames from "classnames";



const ResultItem = forwardRef(
    (
        {
            action,
            active,
            currentRootActionId = '',
        }: {
            action: ActionImpl;
            active: boolean;
            currentRootActionId: ActionId;
        },
        ref: React.Ref<HTMLDivElement>
    ) => {
        const ancestors = useMemo(() => {
            if (!currentRootActionId) return action.ancestors;
            const index = action.ancestors.findIndex(
                (ancestor) => ancestor.id === currentRootActionId
            );
            // +1 removes the currentRootAction; e.g.
            // if we are on the "Set theme" parent action,
            // the UI should not display "Set theme… > Dark"
            // but rather just "Dark"
            return action.ancestors.slice(index + 1);
        }, [action.ancestors, currentRootActionId]);

        return (
            <div
                ref={ ref }
                className={ classNames("flex items-center justify-between cursor-pointer border-l-2 px-4 py-3", active && 'bg-black bg-opacity-10 border-l-gray-900 dark:border-l-gray-100' || 'bg-transparent border-l-transparent') }>
                <div
                    style={ {
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        fontSize: 14,
                    } }
                >
                    { action.icon && action.icon }
                    <div style={ { display: "flex", flexDirection: "column" } }>
                        <div>
                            { ancestors.length > 0 &&
                                ancestors.map((ancestor) => (
                                    <Fragment key={ ancestor.id }>
                                        <span
                                            style={ {
                                                opacity: 0.5,
                                                marginRight: 8,
                                            } }
                                        >
                                            { ancestor.name }
                                        </span>
                                        <span
                                            style={ {
                                                marginRight: 8,
                                            } }
                                        >
                                            &rsaquo;
                                        </span>
                                    </Fragment>
                                )) }
                            <span>{ action.name }</span>
                        </div>
                        { action.subtitle && (
                            <span style={ { fontSize: 12 } }>{ action.subtitle }</span>
                        ) }
                    </div>
                </div>
                { action.shortcut?.length ? (
                    <div
                        aria-hidden
                        style={ { display: "grid", gridAutoFlow: "column", gap: "4px" } }
                    >
                        { action.shortcut.map((sc) => (
                            <kbd
                                key={ sc }
                                style={ {
                                    padding: "4px 6px",
                                    background: "rgba(0 0 0 / .1)",
                                    borderRadius: "4px",
                                    fontSize: 14,
                                } }
                            >
                                { sc }
                            </kbd>
                        )) }
                    </div>
                ) : null }
            </div>
        );
    }
);

ResultItem.displayName = 'ResultItem';

function RenderResults() {
    const { results, rootActionId } = useMatches();
    return (
        <KBarResults
            items={ results }
            onRender={ ({ item, active }) =>
                typeof item === "string" ? (
                    <div className="px-4 py-2 text-xs uppercase opacity-50">{ item }</div>
                ) : (
                    <ResultItem
                        action={ item }
                        active={ active }
                        currentRootActionId={ rootActionId! }
                    />
                )
            }
        />
    );
}


const KBarProviderWrapper = ({ children }: { children: React.ReactNode }) => {

    const { setTheme } = useNextTheme();
    const router = useRouter();
    const actions = [
        {
            section: "Navigation",
            id: "main",
            name: 'main',
            shortcut: ['Control+m'],
            keywords: "main",
            perform: () => {
                router.push('/');
            }
        },
        {
            id: 'posts',
            name: "posts",
            keywords: "post",
            shortcut: ['Control+p'],
            perform: () => {
                router.push('/posts');
            }
        },
        {
            id: 'snippet',
            name: "snippet",
            keywords: "snippet",
            shortcut: ['Control+s'],
            perform: () => {
                router.push('/snippet');
            }
        },
        {
            id: 'experience',
            name: "experience",
            keywords: "experience",
            shortcut: ['Control+e'],
            perform: () => {
                router.push('/experience');
            }
        },
        {
            id: "theme",
            name: 'Change theme...',
            section: 'Preferences',
            keywords: 'interface color dark light',
            shortcut: ['Control+d'],
            perform: () => {
                setTheme(document.documentElement.style.colorScheme === PREFERS_COLOR.LIGHT ? PREFERS_COLOR.DARK : PREFERS_COLOR.LIGHT);
            }

        }
    ];

    //useThemeActions

    return (
        <KBarProvider actions={ actions } options={ {
            enableHistory: true,
        } }>
            <KBarPortal>
                <KBarPositioner className="backdrop-blur bg-inherit">
                    <KBarAnimator className="max-w-xl w-full text-inherit overflow-hidden bg-white dark:bg-gray-800 rounded-lg drop-shadow-lg">
                        <KBarSearch className="py-3 px-4 w-full outline-none border-none bg-white dark:bg-gray-800" />
                        <RenderResults />
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            { children }
        </KBarProvider>
    )

}


function AppProvider({ children }: { children: React.ReactNode }) {

    return (
        <ThemeProvider attribute="class">
            <KBarProviderWrapper>
                { children }
            </KBarProviderWrapper>
        </ThemeProvider >
    )
}

export default AppProvider;