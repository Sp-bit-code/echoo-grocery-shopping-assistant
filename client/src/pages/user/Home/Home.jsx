import React from "react";

import MainHero from "../../../components/home/Hero/Hero.jsx";
import CategorySection from "../../../components/home/CategorySection/CategorySection.jsx";
import ProductShowcase from "../../../components/home/ProductShowcase/ProductShowcase.jsx";
import Footer from "../../../components/layout/Footer/Footer.jsx";

import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <MainHero />

      <section className="home-showcase-section">
        <CategorySection />
        <ProductShowcase />
      </section>

      <div className="home-footer-wrap">
        <Footer />
      </div>
    </div>
  );
};

export default Home;