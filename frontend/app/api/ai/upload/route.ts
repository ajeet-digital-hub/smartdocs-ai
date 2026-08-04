import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return NextResponse.json({ ok: false, error: "File type not supported" }, { status: 400 });
    }

    // For now, return a simple acknowledgment
    // In production, this would process the file through AI document analysis
    return NextResponse.json({
      ok: true,
      response: `I've received "${file.name}" (${(file.size / 1024).toFixed(1)} KB). What would you like to know about it? I can summarize, extract text, or answer questions about the content.`,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
