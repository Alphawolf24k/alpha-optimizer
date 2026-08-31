import { writeFile, mkdir, unlink } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type')
    
    // Handle DELETE operations first
    if (type === 'delete-apk') {
      const publicDir = path.join(process.cwd(), 'public', 'downloads')
      const apkPath = path.join(publicDir, 'alpha-optimizer.apk')
      
      try {
        await unlink(apkPath)
        return NextResponse.json({ success: true, message: 'APK deleted' })
      } catch (error) {
        return NextResponse.json({ success: true, message: 'APK already deleted or not found' })
      }
    }
    
    if (type === 'delete-manual') {
      const publicDir = path.join(process.cwd(), 'public', 'downloads', 'manual')
      const manualPath = path.join(publicDir, 'user-manual.pdf')
      
      try {
        await unlink(manualPath)
        return NextResponse.json({ success: true, message: 'Manual deleted' })
      } catch (error) {
        return NextResponse.json({ success: true, message: 'Manual already deleted or not found' })
      }
    }
    
    // Handle UPLOAD operations
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const publicDir = path.join(process.cwd(), 'public', 'downloads')
    await mkdir(publicDir, { recursive: true })
    
    let filePath
    if (type === 'apk') {
      filePath = path.join(publicDir, 'alpha-optimizer.apk')
    } else if (type === 'manual') {
      const manualDir = path.join(publicDir, 'manual')
      await mkdir(manualDir, { recursive: true })
      filePath = path.join(manualDir, 'user-manual.pdf')
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    await writeFile(filePath, buffer)
    
    return NextResponse.json({ success: true, message: 'File uploaded successfully', size: (buffer.length / (1024 * 1024)).toFixed(1) + ' MB' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}