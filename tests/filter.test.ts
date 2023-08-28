import { sub } from "date-fns";


describe("필터 동작 테스트", () => {

    it.skip('값이 숫자일 때, 필터 대상이 하나가 아니라 배열로 올때 처리', () => {
        const subject = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const filterList = [3, 5, 7];
        // 단순히 filter배열만큼 filter를 반복한다.
        // filter 목록을 아 include를 이용한다.
        const strList = filterList.join(' ');
        console.log('strList', strList);
        const out = subject.filter(v => !filterList.includes(v));
        const strOut = subject.filter(v => !strList.includes(v.toString()));
        console.log('out', out, 'str', strOut);
    });

    it('값이 문자열일 때, 필터 대상이 하나가 아니라 배열로 올때 처리', () => {
        const subject = ['어도비', '포토샵', 'footprint', 'mdx-remote', 'next-mdx-remote', '6', '7', '8', '9'];
        const filterList = ['mdx-remote', '포토샵', '7'];
        // 단순히 filter배열만큼 filter를 반복한다.
        // filter 목록을 아 include를 이용한다.
        const strList = filterList.join(' ');
        console.log('strList', strList);
        const out = subject.filter(v => !filterList.includes(v));
        const strOut = subject.filter(v => !strList.includes(v));
        console.log('out', out, 'str', strOut);
    });

});