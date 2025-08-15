import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get folder details and documents
    const folder = await convex.query(api.folders.getFolder, { id });
    
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Get all documents for this folder
    const documents = await convex.query(api.documents.listByFolder, { folderId: id });

    // Organize documents by type
    const organizedDocs = {
      original: documents.filter(doc => doc.type === 'original'),
      ocr: documents.filter(doc => doc.type === 'ocr'),
      plaintext: documents.filter(doc => doc.type === 'plaintext'),
      synthetic: documents.filter(doc => doc.type === 'synthetic'),
      synthdoc: documents.filter(doc => doc.name?.toLowerCase().includes('synthdoc'))
    };

    return NextResponse.json({
      folder,
      documents: organizedDocs,
      totalDocuments: documents.length
    });

  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, documentPath, documentType } = body;

    if (action === 'organize_document') {
      // Add document to the folder with proper categorization
      const document = await convex.mutation(api.documents.createDocument, {
        folderId: id,
        name: documentPath.split('/').pop(),
        type: documentType,
        path: documentPath,
        status: 'organized',
        metadata: {
          organizedAt: Date.now(),
          category: documentType
        }
      });

      return NextResponse.json({ success: true, document });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}