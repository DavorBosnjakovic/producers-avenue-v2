// File: page.tsx
// Path: /src/app/marketplace/products/[id]/page.tsx
// Product detail page using mock data

import { notFound } from 'next/navigation'
import ProductPageClient from './ProductPageClient'
import { getProductById, getProductsBySeller } from '@/lib/mockData/mockProducts'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  const user = null
  const isOwner = false

  const otherProducts = getProductsBySeller(product.seller_id)
    .filter(p => p.product_id !== product.product_id)
    .slice(0, 4)

  return (
    <ProductPageClient 
      product={product}
      otherProducts={otherProducts}
      isOwner={isOwner}
      user={user}
    />
  )
}