import { spreadFloat } from "@/libs/utils";


describe.skip("동작 테스트", () => {
    it("가중정렬 테스트", () => {
        const weightedSample = (arr: number[], weights: number[]) => {
            let roll = Math.random();
            return arr[
                weights
                    .reduce(
                        (acc: number[], w: number, i: number) => (i === 0 ? [w] : [...acc, acc[acc.length - 1] + w]),
                        []
                    )
                    .findIndex((v: number, i: number, s: number[]) => roll >= (i === 0 ? 0 : s[i - 1]) && roll < v)
            ];
        };

        const out = [0.1, .2, .6, .1].reduce(
            (acc: number[], w: number, i: number) => (i === 0 ? [w] : [...acc, acc[acc.length - 1] + w]),
            []
        );
        let roll = 10;//Math.random();
        const ee = [4, 8, 10, 1, 3].findIndex((value: number, index: number, obj: number[]) => {
            return roll >= (index === 0 ? 0 : obj[index - 1]) && roll < value
        });

        //const a = weightedSample([3, 7, 9, 11], [0.1, 0.2, 0.6, 0.1]);
        console.log('arr', ee);
        // expect(out).toEqual([1])

    });
})


describe.skip("실수 랜덤 분포 값 분포", () => {
    it("10~20사이 값", () => {
        for (let i = 0; i < 10; i++) {
            console.log('value', spreadFloat(10, 20));
        }

    })
});

describe.skip("비례식", () => {
    it("세로가 더 클 경우", () => {
        const info = { w: 200, h: 400 };
        const stage = { w: 800, h: 300 };
        const r = Math.min(info.w / info.h, info.h / info.w);
        const sr = Math.min(stage.w / info.w, stage.h / info.h);
        console.log('r', r, 'sr', sr);
        console.log('가로-세로', info.w * sr, info.h * sr);
        //console.log('세로-가로', (stage.h - info.h) * r);

    });
});

describe("팩토리얼", () => {
    it("팩토리얼 함수 기본 구성", () => {
        const factorial = (n: number) => {
            let result = 1;
            let start = n;
            while (start >= 1) {
                result *= start;
                start--;
            }
            return result;
        }
        expect(factorial(5)).toEqual(120);
        expect(factorial(0)).toEqual(1);
        expect(factorial(1)).toEqual(1);
        expect(factorial(2)).toEqual(2);
        expect(factorial(3)).toEqual(6);
    });
});
