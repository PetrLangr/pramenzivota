import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Načti aktivní služby z databáze s kategoriemi
    const activeServices = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    });

    // Transformuj data pro frontend
    const transformedServices = activeServices.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: Number(service.price),
      category: service.category.name,
      color: service.color || service.category.color
    }));
    
    return NextResponse.json({
      success: true,
      data: transformedServices
    });
  } catch (error) {
    console.error('Chyba při načítání služeb:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání služeb' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validace vstupních dat
    const { name, description, duration, price, categoryId } = body;
    
    if (!name || !duration || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // Zde by bylo vytvoření služby v databázi
    // const newService = await prisma.service.create({ data: {...} });
    
    const newService = {
      id: `service_${Date.now()}`,
      name,
      description,
      duration: parseInt(duration),
      price: parseFloat(price),
      categoryId,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newService
    });
  } catch (error) {
    console.error('Chyba při vytváření služby:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při vytváření služby' },
      { status: 500 }
    );
  }
}