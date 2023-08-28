import classNames from "classnames"

type HeadingProps = {
    children: React.ReactNode,
    className?: string
}

function H2({ className, children }: HeadingProps) {
    return (
        <h2 className={ classNames("font-bold text-2xl mb-2", className) }>
            { children }
        </h2>
    )
}



export { H2 };