

describe("toc정보 구성 테스트", () => {
    it("toc뎁스그룹에 따른 객체 구성하기", () => {
        const data: any[] = [
            { value: 'prism을 이용한 코드하이라이트', url: '#prism을-이용한-코드하이라이트', depth: 2 },
            { value: '어떻게 표현되나 보자', url: '#어떻게-표현되나-보자', depth: 3 },
            { value: 'Footnotes', url: '#footnotes', depth: 3 },
            { value: '4층에 살아요', url: '#4층 링크정보', depth: 4 },
            { value: 'inline code', url: '#inline-code', depth: 2 },
            { value: '중간에 나온 3층', url: '#3층 링크정보', depth: 3 },
            { value: '다른 타이틀 스타일', url: '#다른-타이틀-스타일', depth: 2 }
        ];

        /**
         * 시작뎁스에서 단계별로 커지는 값을 추가하며 진행하지만 1이상이 벌어지면 직전 요소를 이용해 탐색을 제게
         * 값이 작아지면 이전 스택을 모두 제거하고 다시 시작.
         * 마지막까지 이것을 반복...
         */
        // 앞뒤로만 비교해도 뎁스관계를 정리할 수 있음.
        for (let i = 1; i < data.length; i++) {
            const pre = data[i - 1];
            const current = data[i];
            if (current.depth - pre.depth === 1) {
                current.parent = pre.url;
            } else if (current.depth === pre.depth) {
                current.parent = pre.parent
            }
        }
        console.log(data);







    });
})