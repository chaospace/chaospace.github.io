
import { useRef } from "react"
import FullScreenButton, { FullScreenImperativeHandle } from "./FullScreenButton"
import { Meta } from "@storybook/react";



const FullScreenExample = (props: any) => {

    const apiRef = useRef<FullScreenImperativeHandle>(null!);
    const targetRef = useRef<HTMLDivElement>(null!);
    const onClick = () => {
        apiRef.current.toggle(targetRef.current);
    }

    return (
        <div ref={ targetRef } className="relative m-10 flex flex-col gap-4 bg-white">
            <div className="bg-red-50 w-10 h-10 truncate">
                풀스크린대상
            </div>
            <FullScreenButton ref={ apiRef } onClick={ onClick } { ...props } />
        </div>
    )
}

const meta = {
    title: 'Elements/FullScreenButton',
    component: FullScreenExample,
    tags: ['autodocs'],
    argTypes: {
        state: { control: 'boolean' }
    }
} satisfies Meta<typeof FullScreenExample>;


export default meta;


export const Default = {

    args: {
        state: false
    }
}

export const FullScreen = {
    argTypes: {
        state: { control: false }
    },
    args: {
        state: true
    }
}