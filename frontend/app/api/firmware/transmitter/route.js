import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const treeId = searchParams.get('tree_id')
    
    if (!treeId) {
      return NextResponse.json(
        { error: 'tree_id parametri kerak' },
        { status: 400 }
      )
    }
    
    // Read transmitter.ino file
    // Try multiple paths to find the firmware file
    let filePath
    let fileContent
    
    // Try multiple paths to find firmware file
    // Path 1: Mounted volume path (production Docker)
    try {
      filePath = join(process.cwd(), 'firmware', 'transmitter', 'transmitter.ino')
      fileContent = await readFile(filePath, 'utf-8')
    } catch (error1) {
      // Path 2: From frontend directory, go up one level (local development)
      try {
        filePath = join(process.cwd(), '..', 'firmware', 'transmitter', 'transmitter.ino')
        fileContent = await readFile(filePath, 'utf-8')
      } catch (error2) {
        // Path 3: From project root (if running from root)
        try {
          filePath = join(process.cwd(), '..', '..', 'firmware', 'transmitter', 'transmitter.ino')
          fileContent = await readFile(filePath, 'utf-8')
        } catch (error3) {
          throw new Error(`Firmware faylini topib bo'lmadi. Tried: ${error1.message}, ${error2.message}, ${error3.message}`)
        }
      }
    }
    
    // Replace TREE_ID with the provided tree_id
    fileContent = fileContent.replace(
      /#define TREE_ID \d+/,
      `#define TREE_ID ${treeId}`
    )
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="transmitter_tree_${treeId}.ino"`,
      },
    })
  } catch (error) {
    console.error('Error reading transmitter.ino:', error)
    return NextResponse.json(
      { error: 'Firmware faylini o\'qib bo\'lmadi' },
      { status: 500 }
    )
  }
}

