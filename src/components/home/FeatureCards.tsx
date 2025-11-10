// File: FeatureCards.tsx
// Path: /src/components/home/FeatureCards.tsx

'use client';

import Link from 'next/link';
import { Users, ShoppingBag, Wrench } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with musicians, producers, and creators from around the world.',
    link: '/community',
    color: 'bg-blue-500'
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    description: 'Buy and sell beats, samples, services, and more.',
    link: '/marketplace',
    color: 'bg-purple-500'
  },
  {
    icon: Wrench,
    title: 'Tools',
    description: 'Access powerful tools to enhance your creative workflow.',
    link: '/tools',
    color: 'bg-green-500'
  }
];

export default function FeatureCards() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.link}
                className="group bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] hover:border-[#009ae9] dark:hover:border-[#009ae9] transition-all hover:shadow-lg"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a1a] dark:text-[#f5f5f5] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#666666] dark:text-[#b3b3b3] leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-[#009ae9] font-medium group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}