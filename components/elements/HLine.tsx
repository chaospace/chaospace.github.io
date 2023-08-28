import classNames from "classnames";

function HLine({ className }: { className?: string }) {
    const mClassName = classNames('border-none h-px bg-gray-200 dark:bg-gray-800', className);
    return (
        <hr className={ mClassName } />
    )
}

export default HLine;