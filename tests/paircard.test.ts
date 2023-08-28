describe("카드 짝  맞추기", () => {


    it("입력에 따른 카드맵을 서로 매칭시키기", () => {

        const input = [
            [1, 0, 0, 3],
            [2, 0, 0, 0],
            [0, 0, 0, 2],
            [3, 0, 1, 0]
        ];

        const pairs: any = {};
        let rows = 4;
        let cols = 4;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const type = input[y][x];
                if (type === 0) continue; //빈 곳은 제외
                if (!pairs[type]) {
                    pairs[type] = [];
                }
                pairs[type].push([y, x]);
            }
        }

        //페어 정보를 구성 후 탐색을 시작
        //탐색방법은 일단 경우의 수를 모두 고려해 찾고 그 후 결과같이 가장 작은 값은 리턴
        console.log(pairs);

    });


});