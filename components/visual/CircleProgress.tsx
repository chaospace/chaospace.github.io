'use client';

import useIsomorphicEffect from "@/libs/hooks/useIsomorphicEffect";
import { gsap } from "gsap";
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import SplitType from "split-type";
import { ProgressState } from "@/const";

const getProgressPath = (cx: number, cy: number, radius: number, progress: number) => {

    //12시 방향 시작을 위해 시작값을 90으로 설정
    const startAngle = Math.PI / 2;
    const PI = Math.PI * 2;
    const angle = -1 * startAngle + PI * (progress % 1);
    const x = cx + (Math.cos(angle) * radius) - 0.01;
    const y = cy + Math.sin(angle) * radius;
    let dir = angle >= startAngle ? 1 : 0;

    // 시작 위치와 종료위치가 같을 경우 사라지는 현상 제거를 위해 방향값과 endX값을 일부러 일치시키지 않음.
    if (progress % 1 === 0 && progress > 0) {
        dir = 1;
    }

    return [
        `M ${cx},${cy}`,
        `L ${cx},${cy - radius}`,
        `A ${radius},${radius} 0 ${dir}, 1 ${x},${y}`,
        `Z`
    ].join(" ");

}

const setProgressPath = (ele: SVGPathElement, progress: number) => {
    ele.setAttribute('d', getProgressPath(50, 50, 48, progress));
}


interface ProgressProps {
    /**
     * 프로그레스바 컬러를 설정 문자열 형태는 css컬러와 동일 기본값은 #ffcc00
     */
    color?: string

    /**
     * 프로그레스바 상태를 나타내는 enum 각 값에 따라 애니메이션 상태가 결정됨 
     * ProgressState.INIT = 시작, ProgressState.PROGRESS = 진행중, ProgressState.COMPLETE = 완료
     */
    progress?: ProgressState

    /**
     * 상단 circle에 크기를 결정하는 값 기본값은 0.5
     */
    progressSize?: number

    /**
     * 상태 애니메이션 반복여부를 결정하는 boolean 기본값은 false 
     */
    repeat?: boolean
}

interface ProgressImperativeHandler {
    show(): void
    hide(): void
    reset(): void
}

/* 
function CompImp<T extends ProgressImperativeHandler, P extends ProgressProps>({ progress = ProgressState.INIT, progressSize = 0.5, color = '#ffcc00', repeat = false }: P, ref: React.ForwardedRef<T>) {

    const comp = useRef<HTMLDivElement>(null!);
    const tweenRef = useRef<gsap.Context>(null!);
    const splitTextRef = useRef<SplitType>(null!);

    useIsomorphicEffect(() => {
        const labelEle: HTMLParagraphElement = comp.current.querySelector('p.progress-label')!;
        splitTextRef.current = new SplitType(labelEle, { types: "chars, words" });
        tweenRef.current = gsap.context(() => { }, comp);

        gsap.set(labelEle, { perspective: 400 });

        //애니메이션 정의
        // tweenRef.current.add('intro', () => {

        // });
        // tweenRef.current.revert()
        // tweenRef.current.add('progress', () => {

        // });

        // tweenRef.current.add('complete', () => {

        // });
        //tweenRef.current.


        return () => {
            tweenRef.current.revert(); // cleanup
            splitTextRef.current.revert();
        }
    }, []);


    useIsomorphicEffect(() => {
        const scale = ~~(progressSize * 48);
        gsap.set(comp.current.querySelector('.progress-circle')!, { width: scale, height: scale })

    }, [progressSize]);




    useIsomorphicEffect(() => {
        const pathEle = comp.current.querySelector('svg > path')! as SVGPathElement;

        if (progress === ProgressState.COMPLETE && process.env.STORY_BOOK) {
            comp.current.dataset.progress = '1';
        }

        switch (progress) {

            case ProgressState.DEFAULAT:
                setProgressPath(pathEle, 1);
                break;
            case ProgressState.INIT:
                tweenRef.current.add(() => {
                    tweenRef.current.kill(true);
                    const intro = gsap.timeline({
                        repeat: repeat ? -1 : 0,
                        repeatDelay: 0.5
                    });
                    intro.call(() => {
                        setProgressPath(pathEle, 1);
                    })
                        .from(".progress-circle", {
                            duration: 0.6,
                            scale: 0,
                            transformOrigin: '50% 50%',
                            ease: "power1"
                        })
                        .from(
                            splitTextRef.current.chars, {
                            autoAlpha: 0,
                            scale: 0,
                            y: 5,
                            rotationY: -360,
                            duration: 0.6,
                            transformOrigin: '50% 50%',
                            ease: "power1",
                        })
                        .to(splitTextRef.current.chars, {
                            duration: 0.6,
                            keyframes: {
                                y: [0, -5, 0],
                                color: ["white", "black", "white"],
                            },
                            repeat: -1,
                            stagger: 0.05,
                            ease: "power1"
                        })
                        .to(
                            comp.current.dataset, {
                            progress: 1,
                            repeat: -1,
                            duration: 0.6,
                            onStart: () => {
                                comp.current.dataset.progress = '0';
                            },
                            onUpdate: () => {
                                const p = Number(comp.current.dataset.progress);
                                setProgressPath(pathEle, p);
                            },
                            ease: "power1"
                        })

                });
                break;

            case ProgressState.COMPLETE:
                tweenRef.current.add(() => {
                    const outro = gsap.timeline({ repeat: repeat ? -1 : 0, repeatDelay: 0.5 });
                    outro.to(
                        comp.current.dataset, {
                        duration: 0.6,
                        progress: 0,
                        onUpdate: () => {
                            const p = Number(comp.current.dataset.progress);
                            setProgressPath(pathEle, p);
                        },
                        ease: "power1"
                    }).to(
                        splitTextRef.current.chars, {
                        duration: 0.6,
                        autoAlpha: 0,
                        scale: 0,
                        rotationY: -360,
                        transformOrigin: '50% 100%',
                        stagger: 0.1,
                        ease: "power2"
                    }, "<");
                });
                break;
        }

        return () => {
            tweenRef.current.revert();
        }

    }, [progress, repeat]);


    useImperativeHandle(ref, () => {
        return {
            show: () => { 
            },
            hide: () => { },
        } as T;
    }, []);

    return (
        <div ref={ comp } className="relative text-center">
            <div className="progress-circle w-20 h-20 text-inherit mx-auto">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="gradient">
                            <stop offset="90%" stopColor="red" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                    <path fill={ color } />
                </svg>
            </div>
            <p className="progress-label text-3xl text-white text-shadow subpixel-antialiased">
                Santorini
            </p>
        </div>
    )
}
 */

const CircleProgress = forwardRef<ProgressImperativeHandler, ProgressProps>(({ progress = ProgressState.INIT, progressSize = 0.5, color = '#ffcc00', repeat = false }, ref) => {


    const comp = useRef<HTMLDivElement>(null!);
    const tweenRef = useRef<gsap.Context>(null!);
    const splitTextRef = useRef<SplitType>(null!);

    useIsomorphicEffect(() => {
        const labelEle: HTMLParagraphElement = comp.current.querySelector('p.progress-label')!;
        splitTextRef.current = new SplitType(labelEle, { types: "chars, words" });
        tweenRef.current = gsap.context(() => { }, comp);
        gsap.set(labelEle, { perspective: 400 });

        const pathEle = comp.current.querySelector('svg > path')! as SVGPathElement;
        const progressContainer = comp.current.querySelector('.progress-circle');

        //애니메이션 정의
        tweenRef.current.add('show', () => {
            //tweenRef.current.revert();
            const tl = gsap.timeline({ ease: 'power1' });
            tl.call(() => {
                comp.current.dataset.progress = '0';
                gsap.set(comp.current, { autoAlpha: 1 });
                setProgressPath(pathEle, 1);
            }).from(comp.current, {
                duration: .6,
                autoAlpha: 0,
                y: 10,
                transformOrigin: '50% 50%'
            }).from(splitTextRef.current.chars, {
                duration: 0.5,
                scale: 0,
                rotationY: -180,
                stagger: 0.1,
                transformOrigin: '50% 100%',
            }, "<").from(progressContainer, {
                duration: .6,
                scale: 0,
                transformOrigin: '50% 50%'
            }, "<").to(comp.current.dataset, {
                duration: 1,
                progress: 1,
                repeat: -1,
                onUpdate: () => {
                    setProgressPath(pathEle, Number(comp.current.dataset.progress));
                }
            }).to(
                splitTextRef.current.chars, {
                duration: 0.6,
                keyframes: {
                    color: ['white', 'black', 'white'],
                    y: [0, -5, 0]
                },
                stagger: 0.1,
                repeat: -1,
                repeatDelay: 0.5,
            }, "<")
        });

        tweenRef.current.add('hide', () => {
            const tl = gsap.timeline();
            tl.to(comp.current, {
                duration: 0.6,
                autoAlpha: 0,
                y: -10
            }).to(
                comp.current.dataset, {
                duration: 0.6,
                progress: 0,
                onUpdate: () => {
                    const p = Number(comp.current.dataset.progress);
                    setProgressPath(pathEle, p);
                },
                ease: "power1"
            }, "<").to(
                splitTextRef.current.chars, {
                duration: 0.6,
                autoAlpha: 0,
                scale: 0,
                rotationY: -360,
                transformOrigin: '50% 100%',
                stagger: 0.1,
                ease: "power2"
            }, "<");
        });

        return () => {
            tweenRef.current.revert(); // cleanup
            splitTextRef.current.revert();
        }
    }, []);


    useIsomorphicEffect(() => {
        const scale = ~~(progressSize * 48);
        gsap.set(comp.current.querySelector('.progress-circle')!, { width: scale, height: scale })
    }, [progressSize]);




    useIsomorphicEffect(() => {

        const pathEle = comp.current.querySelector('svg > path')! as SVGPathElement;
        if (progress === ProgressState.COMPLETE && process.env.STORY_BOOK) {
            comp.current.dataset.progress = '1';
        }

        switch (progress) {

            case ProgressState.DEFAULAT:
                setProgressPath(pathEle, 1);
                break;
            case ProgressState.INIT:
                tweenRef.current.show();

                break;

            case ProgressState.COMPLETE:
                tweenRef.current.hide();
                break;
        }

        return () => {
            tweenRef.current.revert();
        }

    }, [progress, repeat]);


    useImperativeHandle(ref, () => {
        return {
            show: () => {
                tweenRef.current.show();
            },
            hide: () => {
                tweenRef.current.hide();
            },
            reset: () => {
                tweenRef.current.revert();
            }
        }
    }, []);

    return (
        <div ref={ comp } className="relative text-center">
            <div className="progress-circle w-20 h-20 text-inherit mx-auto">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow">
                    <defs>
                        <radialGradient id="gradient">
                            <stop offset="90%" stopColor="red" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                    <path fill={ color } />
                </svg>
            </div>
            <p className="progress-label text-3xl text-white text-shadow subpixel-antialiased">
                Santorini
            </p>
        </div>
    )
});

// const CircleProgress = forwardRef(CompImp);

export default CircleProgress;