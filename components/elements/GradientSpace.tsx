import classNames from "classnames";



function GradientSpace({ height = 8, toTop = false }: { height?: number, toTop?: boolean }) {

    return (
        <div className={ classNames("from-gray-100 to-transparent to-20% dark:from-gray-950",
            `h-${height}`,
            toTop ? 'bg-gradient-to-t' : 'bg-gradient-to-b'
        ) } />
    )

}


export default GradientSpace;