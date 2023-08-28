


function TagUI({ tags }: { tags: string[] }) {
    return (
        <ul className="flex flex-wrap gap-1 items-center mb-2">
            {
                tags.map((tag, idx) => {
                    return (
                        <li key={ idx } className="rounded bg-gray-400 bg-opacity-20 p-1 text-[10px]">
                            { tag.toUpperCase() }
                        </li>
                    )
                })
            }
        </ul>
    )
}


export default TagUI;