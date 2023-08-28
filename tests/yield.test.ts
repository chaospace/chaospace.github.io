


describe.skip("yield동작 테스트", () => {

    it.skip("yield를 통해 작업에 연산값 리턴을 기다린다.", () => {

        function* nestedOperation(input: number) {
            yield input / 2;
        }

        function* longOperation() {
            let sum = 0;
            for (let i = 0; i < 200000; i++) {
                sum += i;
            }
            console.log('sum', sum);
            yield* nestedOperation(sum);

        }

        const operGen = longOperation();
        const { done, value } = operGen.next();

        console.log(done, value);


    });

    it("2진 배수 동작 테스트", () => {

        let max = 400 * 2;
        let i = 1;
        console.log('max', max);
        while (i < max) {
            i = i << 1;
            if (i > max) {
                i = max;
            }
            console.log('i', i);
        }

    });

});


describe.skip("제너레이터 동작테스트", () => {
    it.skip("runner를 통한 동작확인", () => {
        function generatorRunner(generatorFunc: any) {

            const callback = ({ value, done }: IteratorResult<any>) => {
                console.log('value', value);
                if (done) {
                    return value;
                }
                callback(generator.next(value) as any);
            }
            const generator = generatorFunc();
            callback(generator.next());
        }


        // 
        generatorRunner(function* foo() {

            let r: number = yield 100;
            r = yield 200 + r;
            r = yield 300 + r;
            r = yield 400 + r;
            return r;
        });
    });
    it("제너레이터를 이용한 데이터 전달", () => {
        function* sendValueGenerator() {
            let a = 0;
            for (let i = 0; i < 10; i++) {
                yield a + i;
            }
            return a;
        }
        const gen = sendValueGenerator();
        let r = gen.next();
        while (!r.done) {
            console.log('value', r.value);
            r = gen.next();
        }
        console.log('end-value', r.done, r.value);
    })
})

describe.skip("역할에 다른 제너레이터 구성", () => {
    it("binder와 receiver를 이용한 구성", () => {
        function* receiverUser(name: string) {
            try {
                while (true) {
                    let message: string = yield; // yield로 멈춘상태로 정보가 오기를 대기
                    console.log(`${name}-receive-message`, message);
                }
            } catch (error) {

            } finally {
                console.log('done');
            }
        }

        function userBinder() {
            let _users: Generator[] = [];
            return {
                append: (user: Generator) => {
                    if (!_users.includes(user)) {
                        _users.push(user);
                    }
                    return _users;
                },
                remove: (user: Generator) => {
                    if (_users.includes(user)) {
                        _users = _users.filter(u => user !== u);
                    }
                    return _users;
                },
                reset: () => {
                    for (let u of _users) {
                        u.return(null);
                    }
                    _users = [];
                },
                send: (user: Generator, message: string) => {
                    _users.forEach(u => {
                        if (user !== u) {
                            u.next(message);
                        }
                    })
                }
            }
        }


        const userA = receiverUser('베지터');
        const userB = receiverUser('카카롯트');
        const userC = receiverUser('피코로');
        userA.next(); //yield위치로 이동
        userB.next();
        userC.next();

        const uBinder = userBinder();
        uBinder.append(userA);
        uBinder.append(userB);
        uBinder.append(userC);
        uBinder.send(userA, 'Hello~~');
        uBinder.send(userB, '안녕!~~');
        uBinder.send(userC, '나메크성 gogo!!~~');
        // 종료
        uBinder.reset();

    });


});


function asyncGeneratorRunnder<T, TReturn, TNext>(generatorFunc: (...args: any[]) => Generator<T, TReturn, TNext>) {
    return (...args: Parameters<typeof generatorFunc>) => {
        let generator = generatorFunc.apply(null, [...args]);
        const handle = (result: IteratorResult<T, TReturn>): Promise<TReturn> => {
            //완료상태가 되면 반복을 종료한다.
            if (result.done) return Promise.resolve(result.value);
            //promise를 통해 resolve가 이루어지는 순간 순차적으로 다음 요청을 반복한다.
            return Promise.resolve(result.value).then((res: any) => {
                return handle(generator.next(res));
            }, (error) => {
                return handle(generator.throw(error));
            });
        }

        try {
            //최초 yield위치 이동을 위해 next를 호출하며 시작.
            return handle(generator.next());
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

// 제너레이터 연결 함수
function generatorBinder(source: Generator, receiver: Generator, delay = 0) {
    const toNext = () => {
        const r = source.next();
        if (!r.done) {

            receiver.next(r.value);
            //setTimeout(toNext, delay);
            toNext();
        } else {
            receiver.return(null); //종료
        }
    }
    toNext();
}

function generatorConsumer(func: GeneratorFunction) {
    return (...args: Parameters<typeof func>): ReturnType<typeof func> => {
        const generator = func(...args);
        generator.next(); // 최초 yield위치 이동
        return generator;
    }
}

describe.skip("제너레이터 비동기처리", () => {
    it("기본동작 확인", () => {

        function appendTen(input: number) {
            return (input + 10);
        }

        function divHalf(input: number) {
            return (input / 2);
        }

        const foo = asyncGeneratorRunnder<number, number, number>(function* foo(start: number) {
            let output: number = yield appendTen(start);
            let r: number = yield divHalf(output);
            return r;
        });

        foo(10).then(res => {
            console.log('result', res);
        });

    });
});

describe.skip("제너레이터 체이닝", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    })
    afterEach(() => {
        vi.restoreAllMocks();
    })
    it("동작 확인", () => {
        const oneStep = generatorConsumer(function* (receiver: Generator) {
            try {
                while (true) {
                    let b = yield;
                    //다음 제너레이터에 전달.
                    receiver.next(Number(b) + 1);
                }
            } finally {
                console.log('done');
            }
        } as GeneratorFunction);

        // 
        // 데이터 전달 역할을 하는 제너레이터
        function* fooValue() {
            for (let i = 0; i < 5; i++) {
                yield i;
            }
        }

        const nextStep = generatorConsumer(function* () {
            while (true) {
                try {
                    let value = yield;
                    console.log('value', Number(value) * 2);
                } finally {
                    console.log('done');
                }
            }
        } as GeneratorFunction);

        generatorBinder(fooValue(), oneStep(nextStep()));


    });
});


describe("제너레이터 캔슬 처리", () => {

    it("return을 이용한 캔슬", () => {
        function* genFunc() {
            for (let i = 0; i < 10; i++) {
                yield i * 2;
            }
            return 'complete';
        }

        const fooGen = genFunc();
        //let a = fooGen.next();
        // while (!a.done) {
        //     console.log('a', a.value);
        //     a = fooGen.next();
        // }
        // for (let a of fooGen) {
        //     console.log('a', a);
        // }

        let a = fooGen.next();
        console.log('a', a);
        a = fooGen.return('cancel');
        console.log('return-a', a);



    })

});