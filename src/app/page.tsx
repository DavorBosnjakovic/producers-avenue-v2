// File: page.tsx
// Path: /src/app/page.tsx
// Homepage - main landing page

'use client';

import Hero from '@/components/home/Hero'
import AboutSection from '@/components/home/AboutSection'
import FeatureCards from '@/components/home/FeatureCards'
import Carousel from '@/components/common/Carousel'
import ProductCard from '@/components/marketplace/products/ProductCard'
import ServiceCard from '@/components/marketplace/services/ServiceCard'

export default function HomePage() {
  // TODO: Fetch featured products, services, webinars from database
  // For now, using placeholder data
  
  const featuredProducts = [
    {
      id: '1',
      title: 'Lo-Fi Hip Hop Beat Pack',
      price: 29.99,
      image: '/images/community-card.jpg',
      seller: { name: 'ProducerX', avatar: '/images/community-card.jpg' },
      rating: 4.5,
      reviewCount: 24,
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Trap Drum Kit Vol. 3',
      price: 19.99,
      image: '/images/marketplace-card.jpg',
      seller: { name: 'BeatMaker', avatar: '/images/marketplace-card.jpg' },
      rating: 5,
      reviewCount: 42,
      isFeatured: true,
    },
    {
      id: '3',
      title: 'Vocal Preset Pack - Melodyne',
      price: 39.99,
      image: '/images/tools-card.jpg',
      seller: { name: 'MixMaster', avatar: '/images/tools-card.jpg' },
      rating: 4.8,
      reviewCount: 18,
      isFeatured: false,
    },
    {
      id: '4',
      title: 'EDM Synth Loops Collection',
      price: 24.99,
      image: '/images/community-card.jpg',
      seller: { name: 'SynthWave', avatar: '/images/community-card.jpg' },
      rating: 4.7,
      reviewCount: 31,
      isFeatured: false,
    },
    {
      id: '5',
      title: 'Guitar Riff MIDI Pack',
      price: 14.99,
      image: '/images/marketplace-card.jpg',
      seller: { name: 'RiffMaker', avatar: '/images/marketplace-card.jpg' },
      rating: 4.6,
      reviewCount: 15,
      isFeatured: false,
    },
  ]

  const featuredServices = [
    {
      id: '1',
      title: 'Professional Mixing & Mastering',
      startingPrice: 99.99,
      image: '/images/services/placeholder-1.jpg',
      seller: { name: 'AudioPro', avatar: '/images/avatars/placeholder.jpg' },
      rating: 5,
      reviewCount: 87,
      deliveryTime: '3 days',
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Custom Beat Production',
      startingPrice: 149.99,
      image: '/images/services/placeholder-2.jpg',
      seller: { name: 'ProducerX', avatar: '/images/avatars/placeholder.jpg' },
      rating: 4.9,
      reviewCount: 52,
      deliveryTime: '5 days',
      isFeatured: true,
    },
    {
      id: '3',
      title: 'Vocal Recording & Editing',
      startingPrice: 79.99,
      image: '/images/services/placeholder-3.jpg',
      seller: { name: 'VocalCoach', avatar: '/images/avatars/placeholder.jpg' },
      rating: 4.8,
      reviewCount: 34,
      deliveryTime: '2 days',
      isFeatured: true,
    },
    {
      id: '4',
      title: 'Music Video Production',
      startingPrice: 499.99,
      image: '/images/services/placeholder-4.jpg',
      seller: { name: 'VideoCreator', avatar: '/images/avatars/placeholder.jpg' },
      rating: 4.7,
      reviewCount: 28,
      deliveryTime: '7 days',
      isFeatured: true,
    },
    {
      id: '5',
      title: 'Album Cover Design',
      startingPrice: 59.99,
      image: '/images/services/placeholder-5.jpg',
      seller: { name: 'DesignStudio', avatar: '/images/avatars/placeholder.jpg' },
      rating: 5,
      reviewCount: 65,
      deliveryTime: '2 days',
      isFeatured: true,
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* About Section - Placeholder */}
      <AboutSection />

      {/* Feature Cards - Community, Marketplace, Tools */}
      <FeatureCards />

      {/* Featured Products Carousel */}
      <Carousel 
        title="Featured Products" 
        viewAllLink="/marketplace/products/featured"
      >
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </Carousel>

      {/* Featured Services Carousel */}
      <Carousel 
        title="Featured Services" 
        viewAllLink="/marketplace/services/featured"
      >
        {featuredServices.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </Carousel>

      {/* TODO: Add Featured Webinars Carousel (Phase 2) */}
      {/* TODO: Add Trending Creators Carousel (Optional) */}
      {/* TODO: Add CTA Section */}
    </>
  )
}