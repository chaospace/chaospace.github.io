'use client';

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";

function LocationMenu() {

    const pathname = usePathname();
    // const locations = pathname.split('/').filter(v => !!v);
    // locations.unshift('Home')

    const provider = useMemo(() => {
        const locations = pathname.split('/').filter(v => !!v);
        locations.unshift('Home');
        return locations.map(l => {
            return {
                label: l,
                link: l === 'Home' ? '/' : `/${l}`
            }
        })
    }, [pathname]);

    return (
        <nav className="flex flex-row gap-2 items-center">
            { provider.map((vo, idx) => {
                return (
                    <Fragment key={ vo.label }>
                        <Link className="underline underline-offset-4" href={ vo.link }>
                            { vo.label.toUpperCase() }
                        </Link>
                        { idx < (provider.length - 1) && <FontAwesomeIcon icon={ faAngleRight } size="xs" /> }
                    </Fragment>
                )
            })
            }
        </nav>
    )


}


export default LocationMenu;