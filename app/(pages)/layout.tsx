
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/css/globals.scss';
import "@/css/prism.scss";


type RootLayoutParams = {
  children: React.ReactNode
}


export default function RootLayout({ children }: RootLayoutParams) {

  return (
    <section className='relative mx-auto w-full max-w-7xl px-5 sm:px-10 mb-20'>
      { children }
    </section>

  )
}