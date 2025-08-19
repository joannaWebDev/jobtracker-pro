import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database (for JWT + PrismaAdapter compatibility)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Create user if it doesn't exist
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
      });
    }

    const userId = user.id;

    const body = await request.json();
    const { externalJobId, jobTitle, company, location, source, externalUrl } = body;

    // Validate required fields
    if (!externalJobId || !jobTitle || !company || !location || !source || !externalUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        externalJobId_userId: {
          externalJobId,
          userId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 });
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        userId,
        externalJobId,
        jobTitle,
        company,
        location,
        source,
        externalUrl,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}