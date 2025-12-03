import Hero from '@/components/home_page/Hero';
import Hilight from '@/components/home_page/Hilight';
import Features from '@/components/home_page/Features';
import Carousel from '@/components/home_page/Carousel';
import Footer from '@/components/home_page/Footer';

const page = () => {
  return (
    <div>
      <Hero />
      <Hilight />
      <Features />
      <Carousel />
      <Footer />
    </div>
  )
}

export default page
