


describe.skip("float32 비교", () => {
    const isSame = (a: Float32Array, b: Float32Array) => {
        if (a.length !== b.length) {
            return false;
        }
        console.log('여기는 오지 않음.')
        return JSON.stringify(a) === JSON.stringify(b);
    }
    it("길이가 서로 다른 배열은 length만으로 차이를 판단한다.", () => {
        const a = new Float32Array(4);
        const b = new Float32Array(3);
        expect(isSame(a, b)).toEqual(false);
    })

    it("길이가 같은 배열은 JSON.stringify를 이용해 문자열 비교로 판단한다.", () => {
        const a = new Float32Array(
            [0.007151395082473755,

                0.006663106381893158,

                0.006032399833202362,

                0.006266371812671423,

                0.006663106381893158,

                0.006698710843920708,

                0.006378271151334047]
        );
        const b = new Float32Array([0.007151395082473755,

            0.006663106381893158,

            0.006032399833202362,

            0.006266371812671423,

            0.006663106381893158,

            0.006698710843920708,

            0.006378271151334047]);
        expect(isSame(a, b)).toEqual(true);
    })
})


describe("문자열 날짜 비교", () => {
    it("문자열을 이용한 날짜 비교처리", () => {
        let dates = ['2022-01-01', '2019-10-11', '2023-01-22']
        const r = dates.sort((a, b) => {
            const aTime = new Date(a);
            const bTime = new Date(b);
            if (aTime < bTime) {
                return -1;
            } else if (aTime > bTime) {
                return 1;
            }
            return 0;
        });
        // console.log('date', dates);
        console.log('결과', r)
        expect(r).toContainEqual(dates);
    });
})

