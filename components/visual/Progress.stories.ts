import type { Meta } from "@storybook/react";



import CircleProgress from "./CircleProgress";
import { ProgressState } from "./ProgressBar";

const meta = {
    title: 'visual/Progress',
    component: CircleProgress,
    tags: ['autodocs'],
    argTypes: {
        progress: {
            //table: { disable: true },
            control: false,
        },
        progressSize: {
            control: { type: 'range', min: 0.1, max: 1, step: 0.1 }
        },
        repeat: {
            control: false
        },
        color: {
            control: 'color'
        }
    }
} satisfies Meta<typeof CircleProgress>;

export default meta;


export const Default = {
    args: {
        progress: ProgressState.DEFAULAT,
        color: '#ffcc00',
        progressSize: 0.5
    }
}

export const Init = {
    args: {
        progress: ProgressState.INIT,
        color: '#ffcc00',
        progressSize: 0.5,
        repeat: true
    }
}

// export const Progress = {
//     args: {
//         progress: ProgressState.PROGRESS,
//         color: '#ffcc00',
//         progressSize: 0.5
//     }
// }

export const Complete = {
    args: {
        progress: ProgressState.COMPLETE,
        color: '#ffcc00',
        progressSize: 0.5,
        repeat: true
    }
}