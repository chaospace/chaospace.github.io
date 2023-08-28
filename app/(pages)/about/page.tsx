
import PageHeader from "@/components/PageHeader";



function AboutPage() {

    return (
        <div className='p-10 min-h-screen'>
            <PageHeader className="mb-10" title="무서록">
                <p>'순서없이 적는 글이라는 뜻'으로 <a className="underline underline-offset-4 font-bold" href="https://namu.wiki/w/%EC%9D%B4%ED%83%9C%EC%A4%80(%EC%86%8C%EC%84%A4%EA%B0%80" target="_blank" >이태준</a>에 수필집을 읽은 후 부터 맘에드는 이름이라 내 블로그 성격과 잘 맞을거 같아 차용.</p>
            </PageHeader>
            <div className="grid grid-flow-row gap-5">
                <article>
                    <p>프론트 개발자로 인터렉티브 UI및 하이브리드 앱 개발 및 운영 경험이 있으며 다양한 프론트 기술에 관심을 가지고 있습니다.</p>
                    <p>효율적인 코드를 위한 함수형, 객체지향에 대한 관심이 많고 HTML5&CSS3스터디 활동을 통한 출판경험이 있습니다.</p>
                </article>
                <article>
                    <h2 className="text-2xl font-bold">사용경험이 있는 언어</h2>
                    <ul className="list-disc list-inside pl-4">
                        <li className="my-1">React</li>
                        <li className="my-1">Vue</li>
                        <li className="my-1">Angular</li>
                        <li className="my-1">Javascript</li>
                        <li className="my-1">HTML/CSS</li>
                        <li className="my-1">Android</li>
                        <li className="my-1">IOS</li>
                    </ul>
                </article>
                <article>
                    <h2 className="text-2xl font-bold">수행 프로젝트</h2>
                    <ul className="list-disc list-inside pl-4">
                        <li className="my-1">콘솔게임</li>
                        <li className="my-1">웹툰</li>
                        <li className="my-1">Angular</li>
                        <li className="my-1">Javascript</li>
                        <li className="my-1">HTML/CSS</li>
                        <li className="my-1">Android</li>
                        <li className="my-1">IOS</li>
                    </ul>
                </article>
            </div>
        </div>
    )
}



export default AboutPage;