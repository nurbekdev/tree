import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Read base_station.ino file
    // Try multiple paths to find the firmware file
    let filePath
    let fileContent
    
    // Try multiple paths to find firmware file
    // Path 1: Mounted volume path (production Docker)
    try {
      filePath = join(process.cwd(), 'firmware', 'base_station', 'base_station.ino')
      fileContent = await readFile(filePath, 'utf-8')
    } catch (error1) {
      // Path 2: From frontend directory, go up one level (local development)
      try {
        filePath = join(process.cwd(), '..', 'firmware', 'base_station', 'base_station.ino')
        fileContent = await readFile(filePath, 'utf-8')
      } catch (error2) {
        // Path 3: From project root (if running from root)
        try {
          filePath = join(process.cwd(), '..', '..', 'firmware', 'base_station', 'base_station.ino')
          fileContent = await readFile(filePath, 'utf-8')
        } catch (error3) {
          throw new Error(`Firmware faylini topib bo'lmadi. Tried: ${error1.message}, ${error2.message}, ${error3.message}`)
        }
      }
    }
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="base_station.ino"',
      },
    })
  } catch (error) {
    console.error('Error reading base_station.ino:', error)
    return NextResponse.json(
      { error: `Firmware faylini o'qib bo'lmadi: ${error.message}` },
      { status: 500 }
    )
  }
}

