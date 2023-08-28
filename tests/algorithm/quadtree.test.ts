

/**
 * 쿼드트리
 * 입력값은 2N승 문자열을 압축 0과 1로 구성
 * 주변 4개의 값이 동일하면 하나의 값으로 표현 
 * 그렇지 않으면 나눌 수 있는 그룹으로 묶어서 각각의 숫자를 표현.
 
input
8 

'1111000011110000000111000001110011110000111100001111001111110011'

//8개로 나누기
11110000
11110000
00011100
00011100
11110000
11110000
11110011
11110011

//4개씩 묶음
1111 0000
1111 0000
0001 1100
0001 1100

1111 0000
1111 0000
1111 0011
1111 0011


output
((110(0101)) (0010)1(0001))
 */

function quadTree(n: number, input: string) {
    const len = input.length / n;
    const grid: string[] = Array.from({ length: len }, () => '');
    for (let i = 0; i < len; i++) {
        const start = i * n;
        grid[i] = (input.substring(start, start + n));
    }
    //console.log('grid', grid);
    return grid;
}

function convertGridFormat(input: string, n: number) {
    const len = Math.floor(input.length / n);
    const output: string[] = new Array();
    for (let i = 0; i < len; i++) {
        const begin = i * n;
        output.push(input.substring(begin, begin + n));
    }
    return output;
}

const getGridPosValue = (origin: string, x: number, y: number, size: number, current: string[] = []) => {

    if (size < 2) {
        // console.log('종료!', current);
        return current;
    }
    const n = 8;
    let temp: string[] = [];
    for (let iy = y; iy < y + size; iy++) {
        for (let ix = x; ix < x + size; ix++) {
            const index = iy * n + ix;
            temp.push(origin[index]);
        }
    }


    let next = size >> 1;
    // 동일한 값인지 체크
    if (temp.every(v => v === temp[0])) {
        current.push(temp[0]);
        if (temp.length == size ** 2) {
            return current;
        }
    } else { //서로 다를 경우 재귀처리
        if (next < 2) {
            current.push(temp.join(''));
        }
        getGridPosValue(origin, x, y, next, current);
        getGridPosValue(origin, x + next, y, next, current);
        getGridPosValue(origin, x, y + next, next, current);
        getGridPosValue(origin, x + next, y + next, next, current);
    }
    if (current.length > 4) {
        return current;
    }

}

const quadTreeCompress = (input: string, n: number) => {

    const result: string[] = [];
    console.log(input.split('', n));

    const validate = (x: number, y: number, size: number) => {

    }

    validate(0, 0, n);

    return result;
}


const getGridPosRefact = (origin: string, x: number, y: number, size: number, current: string[] = []) => {

    if (size < 2) {
        // console.log('종료!', current);
        return current;
    }

    const n = 8;
    let temp: string[] = [];
    for (let iy = y; iy < y + size; iy++) {
        for (let ix = x; ix < x + size; ix++) {
            const index = iy * n + ix;
            temp.push(origin[index]);
        }
    }

    // 동일한 값인지 체크
    if (temp.every(v => v === temp[0])) {
        current.push(temp[0]);
    } else {




    }

    let next = size >> 1;
    // 동일한 값인지 체크
    if (temp.every(v => v === temp[0])) {
        current.push(temp[0]);
        if (temp.length == size ** 2) {
            return current;
        }
    } else { //서로 다를 경우 재귀처리
        if (next < 2) {
            current.push(temp.join(''));
        }
        getGridPosValue(origin, x, y, next, current);
        getGridPosValue(origin, x + next, y, next, current);
        getGridPosValue(origin, x, y + next, next, current);
        getGridPosValue(origin, x + next, y + next, next, current);
    }
    if (current.length > 4) {
        return current;
    }

}

const everySame = (input: string) => {
    let r = true;
    for (let i = 0; i < input.length; i++) {
        if (input[i] !== input[0]) {
            r = false;
            break;
        }
    }
    return r;
}


const tempQuad = (input: string) => {
    let temp: string[] = [];
    const quotient = input.length >> 2;
    if (quotient < 4) {
        temp.push(input);
        return temp;
    }

    for (let y = 0; y < 2; y++) {
        let w = '';
        for (let x = 0; x < quotient; x++) {
            const idx = y * quotient * 2 + x;
            w += input[idx];
        }
        temp.push(w);
    }
    return temp;
}

describe("쿼드트리 테스트", () => {
    it("입력된 문자열 쿼드 그룹으로 표현하기", () => {
        // 최초 입력된 문자열을 그리드 형식으로 구성한다.
        const n = 8;
        const origin = '1111000011110000000111000001110011110000111100001111001111110011';
        const stack: string[] = [];
        const quotient = ~~(origin.length >> 2);
        console.log('origin', origin.length)
        // for (let i = 0; i < origin.length / quotient; i++) {
        //     const n = i * quotient;
        //     stack.push(origin.substring(n, n + quotient));
        // }
        /* 
        quotient 16 stack [
          '1111000011110000',
          '0001110000011100',
          '1111000011110000',
          '1111001111110011'
        ]
         */

        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                const begin = (y * 2 + x) * quotient;
                stack.push(origin.substring(begin, begin + quotient));
            }
        }
        const one = stack[0];
        if (!everySame(one)) {
            console.log('stack', one.length >> 2);
            console.log(tempQuad(one), 'input', one);
        }

        // 4그룹으로 나누기
        // console.log(getGridPosValue(origin, 0, 0, n));

    });
});

