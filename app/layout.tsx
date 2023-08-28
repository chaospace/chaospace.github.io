
import AppProvider from '@/components/AppProvider';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/css/globals.scss';
import "@/css/prism.scss";

import { Metadata } from 'next';
import ContentBodyWrapper from '@/components/ContentBodyWrapper';

import HLine from '@/components/elements/HLine';
import Header from '@/components/header/Header';
import QuickMenu from '@/components/elements/QuickMenu';
import Footer from '@/components/Footer';

import { noto_sans_kr } from '@/fonts';



type RootLayoutParams = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: {
    default: "chaospace's Blog",
    template: "%s | chaospace's Blog"
  },
  description: '틈틈이 기억나는 내용을 정리하는 공간',
  creator: 'chaospace'
}

export default function RootLayout({ children }: RootLayoutParams) {


  return (
    <html className={ noto_sans_kr.variable } suppressHydrationWarning  >
      <body>
        <AppProvider>
          <ContentBodyWrapper id="main-content" className='relative flex flex-col border-l-gray-200 dark:border-l-gray-800'>
            <Header id='content-header' className='sticky z-10 flex flex-col top-0' />
            { children }
            <HLine />
            <Footer />
          </ContentBodyWrapper>
          <QuickMenu />
        </AppProvider>
      </body>
    </html >
  )
}