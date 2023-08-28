import { Meta } from "@storybook/react";
import OffScreenVisual from "./OffScreenVisual";


const meta = {
    title: "visual/OffScreen",
    component: OffScreenVisual,
    tags: ['autodocs'],
    decorators: [

    ],
    argTypes: {
        className: { table: { disable: true }, control: false },
        url: {
            options: ['santorini', 'the-shade', 'hot-air-balloon'],
            mapping: {
                'santorini': '/images/santorini.jpg',
                'the-shade': '/images/the-shade.jpg',
                'hot-air-balloon': '/images/hot-air-balloon.jpg'
            },
            control: {
                type: "select",
            }
        }
    }
} satisfies Meta<typeof OffScreenVisual>;

export default meta;

export const Default = {
    args: {
        url: '/images/the-shade.jpg'
    }
}