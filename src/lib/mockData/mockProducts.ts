// File: mockProducts.ts
// Path: /src/lib/mockData/mockProducts.ts
// Mock product data for development

export interface MockProduct {
  product_id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  tags: string[]
  bpm?: number
  key?: string
  file_type: string
  demo_url: string
  downloads: number
  status: string
  created_at: string
  seller_id: string
  seller: {
    user_id: string
    username: string
    display_name: string
    avatar_url: string
  }
}

export const mockProducts: MockProduct[] = [
  {
    product_id: 'prod-1',
    title: 'Lo-Fi Hip Hop Beat Pack',
    description: 'A collection of 10 smooth lo-fi beats perfect for studying, relaxing, or creating chill vibes. Each beat features warm vinyl textures, jazzy piano melodies, and head-nodding drum patterns.\n\nWhat\'s Included:\n- 10 unique lo-fi beats\n- WAV format (44.1kHz/24-bit)\n- Stems included\n- Royalty-free for commercial use\n- BPM range: 70-90\n\nPerfect for:\n- YouTube videos\n- Podcasts\n- Background music\n- Music production practice',
    price: 29.99,
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
    ],
    category: 'Beats',
    tags: ['lo-fi', 'hip-hop', 'chill', 'beats', 'instrumental'],
    bpm: 85,
    key: 'Am',
    file_type: 'WAV',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    downloads: 342,
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    seller_id: 'user-1',
    seller: {
      user_id: 'user-1',
      username: 'beatmaker_pro',
      display_name: 'Beat Maker Pro',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
    }
  },
  {
    product_id: 'prod-2',
    title: 'Trap Drum Kit Vol. 3',
    description: 'Heavy-hitting trap drums and 808s designed for modern hip-hop production. This kit contains everything you need to create chart-topping trap beats.\n\nKit Contents:\n- 50 Drum One-Shots\n- 30 808 Bass Samples\n- 25 Hi-Hat Loops\n- 20 Snare Rolls\n- 15 Crash & FX\n\nAll sounds are:\n- Professionally mixed and mastered\n- Ready to drop in your DAW\n- Royalty-free\n- Compatible with all DAWs',
    price: 19.99,
    images: [
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=800&h=600&fit=crop',
    ],
    category: 'Samples',
    tags: ['trap', 'drums', 'samples', '808', 'hip-hop'],
    file_type: 'WAV',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    downloads: 567,
    status: 'active',
    created_at: '2024-01-20T14:45:00Z',
    seller_id: 'user-2',
    seller: {
      user_id: 'user-2',
      username: 'trap_god',
      display_name: 'Trap God',
      avatar_url: 'https://i.pravatar.cc/150?img=33',
    }
  },
  {
    product_id: 'prod-3',
    title: 'R&B Vocal Presets for Antares Auto-Tune',
    description: 'Professional vocal presets designed for modern R&B and pop productions. Get that polished, radio-ready sound instantly.\n\nIncludes:\n- 15 Auto-Tune Pro presets\n- Classic R&B settings\n- Modern pop vocals\n- Trap vocal effects\n- Installation guide\n\nCompatibility:\n- Auto-Tune Pro (latest version)\n- Works with any DAW\n\nPerfect for achieving sounds like:\n- The Weeknd\n- Bryson Tiller\n- Frank Ocean\n- SZA',
    price: 14.99,
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598387181032-a3103a2db5b4?w=800&h=600&fit=crop',
    ],
    category: 'Presets',
    tags: ['r&b', 'vocals', 'auto-tune', 'presets', 'pop'],
    file_type: 'ATG',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    downloads: 234,
    status: 'active',
    created_at: '2024-02-01T09:15:00Z',
    seller_id: 'user-3',
    seller: {
      user_id: 'user-3',
      username: 'vocal_wizard',
      display_name: 'Vocal Wizard',
      avatar_url: 'https://i.pravatar.cc/150?img=45',
    }
  },
  {
    product_id: 'prod-4',
    title: 'Ambient Soundscapes Collection',
    description: 'Ethereal ambient textures and atmospheric soundscapes for film, games, and meditation music. Create immersive sonic environments with these high-quality recordings.\n\nCollection Includes:\n- 25 Ambient Pads (60-120 seconds each)\n- 15 Atmospheric Textures\n- 10 Drone Layers\n- 8 Field Recordings\n\nUse Cases:\n- Film scoring\n- Game audio\n- Meditation apps\n- Background ambience\n- Sound design',
    price: 39.99,
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=600&fit=crop',
    ],
    category: 'Loops',
    tags: ['ambient', 'soundscape', 'atmospheric', 'cinematic', 'texture'],
    file_type: 'WAV',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    downloads: 189,
    status: 'active',
    created_at: '2024-02-05T16:20:00Z',
    seller_id: 'user-1',
    seller: {
      user_id: 'user-1',
      username: 'beatmaker_pro',
      display_name: 'Beat Maker Pro',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
    }
  },
  {
    product_id: 'prod-5',
    title: 'EDM Sidechain Compression Tutorial',
    description: 'Master the art of sidechain compression in electronic music. This comprehensive video tutorial covers everything from basics to advanced techniques.\n\nWhat You\'ll Learn:\n- Sidechain fundamentals\n- Pumping effect techniques\n- Routing in different DAWs\n- Creative sidechain applications\n- Common mistakes to avoid\n\nTutorial Details:\n- 2 hours of video content\n- Project files included\n- Works with any DAW\n- PDF cheat sheet',
    price: 24.99,
    images: [
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=600&fit=crop',
    ],
    category: 'Tutorials',
    tags: ['edm', 'tutorial', 'compression', 'mixing', 'production'],
    file_type: 'MP4',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    downloads: 421,
    status: 'active',
    created_at: '2024-02-10T11:00:00Z',
    seller_id: 'user-4',
    seller: {
      user_id: 'user-4',
      username: 'edm_master',
      display_name: 'EDM Master',
      avatar_url: 'https://i.pravatar.cc/150?img=68',
    }
  },
  {
    product_id: 'prod-6',
    title: 'Melodic House Piano MIDI Pack',
    description: 'Beautiful piano progressions and melodies for melodic house and progressive house productions. 50 MIDI files ready to inspire your next track.\n\nPack Contains:\n- 50 Piano MIDI files\n- Chord progressions\n- Melody loops\n- Arpeggios\n- Key and tempo labeled\n\nGenres:\n- Melodic House\n- Progressive House\n- Deep House\n- Organic House',
    price: 17.99,
    images: [
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
    ],
    category: 'MIDI',
    tags: ['house', 'piano', 'midi', 'melodic', 'progressive'],
    file_type: 'MIDI',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    downloads: 298,
    status: 'active',
    created_at: '2024-02-12T13:30:00Z',
    seller_id: 'user-2',
    seller: {
      user_id: 'user-2',
      username: 'trap_god',
      display_name: 'Trap God',
      avatar_url: 'https://i.pravatar.cc/150?img=33',
    }
  },
  {
    product_id: 'prod-7',
    title: 'Vintage Synth Serum Presets',
    description: 'Authentic vintage synthesizer sounds recreated in Xfer Serum. From classic 80s to modern retro vibes.\n\n100 Presets Including:\n- 25 Basses\n- 30 Leads\n- 20 Pads\n- 15 Plucks\n- 10 FX\n\nInspired By:\n- Juno-106\n- Prophet-5\n- Moog Minimoog\n- Oberheim OB-Xa',
    price: 22.99,
    images: [
      'https://images.unsplash.com/photo-1563330232-57114bb0823c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop',
    ],
    category: 'Presets',
    tags: ['synth', 'serum', 'vintage', 'retro', '80s'],
    file_type: 'FXP',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    downloads: 512,
    status: 'active',
    created_at: '2024-02-15T08:45:00Z',
    seller_id: 'user-3',
    seller: {
      user_id: 'user-3',
      username: 'vocal_wizard',
      display_name: 'Vocal Wizard',
      avatar_url: 'https://i.pravatar.cc/150?img=45',
    }
  },
  {
    product_id: 'prod-8',
    title: 'Afrobeats Starter Pack',
    description: 'Everything you need to start making authentic Afrobeats music. Drums, melodies, and one-shots inspired by top African producers.\n\nIncludes:\n- 40 Drum loops\n- 25 Percussion one-shots\n- 15 Log drum melodies\n- 10 Flute samples\n- 20 Shaker loops\n\nInfluenced by artists like:\n- Wizkid\n- Burna Boy\n- Davido',
    price: 27.99,
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=600&fit=crop',
    ],
    category: 'Samples',
    tags: ['afrobeats', 'drums', 'percussion', 'african', 'world'],
    bpm: 115,
    file_type: 'WAV',
    demo_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    downloads: 445,
    status: 'active',
    created_at: '2024-02-18T10:20:00Z',
    seller_id: 'user-4',
    seller: {
      user_id: 'user-4',
      username: 'edm_master',
      display_name: 'EDM Master',
      avatar_url: 'https://i.pravatar.cc/150?img=68',
    }
  },
]

// Helper function to get a single product by ID
export function getProductById(id: string): MockProduct | undefined {
  return mockProducts.find(p => p.product_id === id)
}

// Helper function to get products by seller
export function getProductsBySeller(sellerId: string): MockProduct[] {
  return mockProducts.filter(p => p.seller_id === sellerId)
}

// Helper function to get related products (same category, different seller)
export function getRelatedProducts(productId: string, limit: number = 4): MockProduct[] {
  const product = getProductById(productId)
  if (!product) return []
  
  return mockProducts
    .filter(p => 
      p.product_id !== productId && 
      p.category === product.category &&
      p.seller_id !== product.seller_id
    )
    .slice(0, limit)
}