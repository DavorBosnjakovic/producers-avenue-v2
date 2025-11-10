// File: route.ts
// Path: /src/app/api/services/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');
    const userId = searchParams.get('user_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get specific service by ID
    if (serviceId) {
      const { data: service, error } = await supabase
        .from('services')
        .select(`
          *,
          seller:user_profiles!services_user_id_fkey(
            id, 
            username, 
            full_name, 
            avatar_url,
            user_type
          ),
          reviews:reviews(
            id,
            rating,
            comment,
            created_at,
            reviewer:user_profiles!reviews_user_id_fkey(id, username, avatar_url)
          )
        `)
        .eq('id', serviceId)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      // Calculate average rating
      const avgRating = service.reviews.length > 0
        ? service.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / service.reviews.length
        : 0;

      return NextResponse.json({ 
        service: {
          ...service,
          average_rating: avgRating,
          review_count: service.reviews.length
        }
      });
    }

    // Build query
    let query = supabase
      .from('services')
      .select(`
        *,
        seller:user_profiles!services_user_id_fkey(
          id, 
          username, 
          full_name, 
          avatar_url
        )
      `)
      .eq('status', 'active');

    // Filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Sort
    const ascending = order === 'asc';
    if (sortBy === 'price') {
      query = query.order('starting_price', { ascending });
    } else if (sortBy === 'popular') {
      query = query.order('views', { ascending: false });
    } else {
      query = query.order('created_at', { ascending });
    }

    query = query.limit(limit);

    const { data: services, error } = await query;

    if (error) throw error;

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      subcategory,
      starting_price,
      delivery_time,
      delivery_time_unit,
      images,
      portfolio_items,
      tags,
      features,
      requirements,
      pricing_tiers
    } = body;

    // Validation
    if (!name || !description || !category || !starting_price) {
      return NextResponse.json(
        { error: 'Name, description, category, and starting price are required' },
        { status: 400 }
      );
    }

    if (starting_price < 5) {
      return NextResponse.json(
        { error: 'Minimum service price is $5' },
        { status: 400 }
      );
    }

    // Create service
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim(),
        category,
        subcategory: subcategory || null,
        starting_price,
        delivery_time: delivery_time || null,
        delivery_time_unit: delivery_time_unit || 'days',
        images: images || [],
        portfolio_items: portfolio_items || [],
        tags: tags || [],
        features: features || [],
        requirements: requirements || null,
        pricing_tiers: pricing_tiers || [],
        status: 'active',
        views: 0,
        orders_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      service,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { service_id, ...updateData } = body;

    if (!service_id) {
      return NextResponse.json(
        { error: 'service_id is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: service } = await supabase
      .from('services')
      .select('user_id')
      .eq('id', service_id)
      .single();

    if (!service || service.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update service
    const { data: updatedService, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', service_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      service: updatedService,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: service } = await supabase
      .from('services')
      .select('user_id')
      .eq('id', serviceId)
      .single();

    if (!service || service.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if service has pending orders
    const { data: pendingOrders } = await supabase
      .from('order_items')
      .select('id, orders!inner(status)')
      .eq('service_id', serviceId)
      .in('orders.status', ['pending', 'processing']);

    if (pendingOrders && pendingOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with pending orders' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to 'deleted'
    const { error } = await supabase
      .from('services')
      .update({ status: 'deleted' })
      .eq('id', serviceId);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}