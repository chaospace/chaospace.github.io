import { Fira_Code, Noto_Sans_KR } from "next/font/google";

const noto_sans_kr = Noto_Sans_KR({ weight: ["100", "400", "700"], subsets: ['latin'], display: "swap", variable: '--font-noto-sans-kr' });
const fira_code = Fira_Code({ weight: ["300", "700"], subsets: ['latin'], display: "swap", variable: '--font-fira-code' });


export {
    noto_sans_kr,
    fira_code
}