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
            options: ['santorini', 'the-shade', 'hot-air-balloon', "pic", "pic_1", "pic_2"],
            mapping: {
                'santorini': '/images/santorini.jpg',
                'the-shade': '/images/the-shade.jpg',
                'hot-air-balloon': '/images/hot-air-balloon.jpg',
                'pic': '/images/pic/pic_0.png',
                'pic_1': '/images/pic/pic_1.png',
                'pic_2': '/images/pic/pic_2.png'
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