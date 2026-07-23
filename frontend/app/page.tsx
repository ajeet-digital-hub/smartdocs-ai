import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar provided by layout */}

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/ai-sky-wallpaper.avif')",
          }}
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative mx-auto max-w-5xl text-center text-white">
          <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            🚀 All-in-One AI Document & Design Platform
          </div>

          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Create. Edit. Design.
            <span className="block text-cyan-300">
              Powered by AI.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100/90">
            SmartDocs AI helps you create passport photos, ID cards,
            resumes, social media designs, PDFs and much more — all in one
            powerful platform.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="rounded-xl bg-white px-8 py-4 font-semibold text-slate-950 shadow-lg hover:bg-slate-100 text-center">
              Get Started Free 🚀
            </Link>

            <button className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white hover:bg-white/20">
              Explore Tools
            </button>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything You Need
            </h2>

            <p className="mt-3 text-gray-600">
              Powerful tools for documents, images and designs.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "📸",
                badge: "PP",
                accent: "bg-violet-100 text-violet-700",
                title: "Passport Photo Maker",
                description: "Create professional passport size photos.",
              },
              {
                icon: "🪄",
                badge: "BR",
                accent: "bg-sky-100 text-sky-700",
                title: "Background Remover",
                description: "Remove image backgrounds instantly.",
              },
              {
                icon: "🖼️",
                badge: "IR",
                accent: "bg-emerald-100 text-emerald-700",
                title: "Image Resize",
                description: "Resize images for any requirement.",
              },
              {
                icon: "✂️",
                badge: "IC",
                accent: "bg-rose-100 text-rose-700",
                title: "Image Crop",
                description: "Crop and adjust your images easily.",
              },
              {
                icon: "🪪",
                badge: "ID",
                accent: "bg-amber-100 text-amber-700",
                title: "ID Card Maker",
                description: "Create professional ID cards.",
              },
              {
                icon: "📄",
                badge: "RB",
                accent: "bg-indigo-100 text-indigo-700",
                title: "Resume Builder",
                description: "Build modern ATS-friendly resumes.",
              },
              {
                icon: "📱",
                badge: "SM",
                accent: "bg-fuchsia-100 text-fuchsia-700",
                title: "Social Media Designer",
                description: "Create posts and banners easily.",
              },
              {
                icon: "📑",
                badge: "PDF",
                accent: "bg-orange-100 text-orange-700",
                title: "PDF Tools",
                description: "Merge, split and compress PDFs.",
              },
            ].map((tool) => (
              <div
                key={tool.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl cursor-pointer"
              >
                <div
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ${tool.accent}`}
                >
                  {tool.badge}
                </div>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {tool.title}
                </h3>

                <p className="mt-2 text-gray-600">
                  {tool.description}
                </p>

                <button className="mt-5 font-medium text-purple-700 transition hover:text-purple-900 hover:underline">
                  Try Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Why SmartDocs AI?
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-4xl">⚡</div>
              <h3 className="mt-4 text-xl font-semibold">
                Fast & Easy
              </h3>
              <p className="mt-2 text-gray-600">
                Create and edit your documents quickly.
              </p>
            </div>

            <div>
              <div className="text-4xl">🤖</div>
              <h3 className="mt-4 text-xl font-semibold">
                AI Powered
              </h3>
              <p className="mt-2 text-gray-600">
                Use AI to create professional content and designs.
              </p>
            </div>

            <div>
              <div className="text-4xl">📱</div>
              <h3 className="mt-4 text-xl font-semibold">
                Works Everywhere
              </h3>
              <p className="mt-2 text-gray-600">
                Fully responsive on desktop, tablet and mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-orange-600 px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold md:text-4xl">
            Start Creating with SmartDocs AI
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-orange-100">
            Create professional documents, photos and designs with powerful
            AI tools.
          </p>

          <button className="mt-8 rounded-xl bg-white px-8 py-4 font-semibold text-orange-600 hover:bg-gray-100">
            Get Started Free 🚀
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-center text-gray-600 md:flex-row md:text-left">
          <p>© 2026 SmartDocs AI. All rights reserved.</p>

          <div className="flex justify-center gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
