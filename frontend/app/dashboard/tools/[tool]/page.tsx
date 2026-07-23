"use client"

import React from "react"
import { useRouter } from "next/navigation"

type Props = {
  params: { tool: string }
}

export default function ToolPage({ params }: Props) {
  const { tool } = params
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <button onClick={() => router.back()} className="mb-6 text-sm text-orange-600">← Back</button>

        <h1 className="text-2xl font-bold text-gray-900">{tool?.toUpperCase()} Tools</h1>
<p className="mt-2 text-gray-600">This toolset is coming soon. We&apos;ll add AI-powered features here.</p>

        <div className="mt-8 rounded-lg border bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Status: Coming Soon</h3>
          <p className="mt-2 text-sm text-gray-600">We&apos;re working on integrating powerful features for {tool}.</p>
        </div>
      </div>
    </main>
  )
}
