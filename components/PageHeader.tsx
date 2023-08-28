
import { H2 } from "./elements/Headings";


function PageHeader({ className, title, children }: { className?: string, title: string, children: React.ReactNode }) {
    return (
        <article className={ className }>
            <H2>{ title }</H2>
            { children }
        </article>
    )
}


export default PageHeader;