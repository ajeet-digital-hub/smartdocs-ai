export interface AppCatalogEntry {
  appId: string;
  name: string;
  packageNames: string[];
  appStoreIds: string[];
  category: "social" | "gaming" | "entertainment" | "education" | "communication" | "productivity" | "utility" | "custom";
  icon: string;
  domains: string[];
  defaultBlocked: boolean;
}

export const APPLICATION_CATALOG: AppCatalogEntry[] = [
  {
    appId: "youtube",
    name: "YouTube",
    packageNames: ["com.google.android.youtube"],
    appStoreIds: ["544007664"],
    category: "entertainment",
    icon: "▶️",
    domains: ["youtube.com", "youtu.be"],
    defaultBlocked: true,
  },
  {
    appId: "instagram",
    name: "Instagram",
    packageNames: ["com.instagram.android"],
    appStoreIds: ["389801252"],
    category: "social",
    icon: "📸",
    domains: ["instagram.com"],
    defaultBlocked: true,
  },
  {
    appId: "facebook",
    name: "Facebook",
    packageNames: ["com.facebook.katana", "com.facebook.orca"],
    appStoreIds: ["284882215"],
    category: "social",
    icon: "👤",
    domains: ["facebook.com", "fb.com"],
    defaultBlocked: true,
  },
  {
    appId: "tiktok",
    name: "TikTok",
    packageNames: ["com.zhiliaoapp.musically"],
    appStoreIds: ["835599320"],
    category: "social",
    icon: "🎵",
    domains: ["tiktok.com"],
    defaultBlocked: true,
  },
  {
    appId: "snapchat",
    name: "Snapchat",
    packageNames: ["com.snapchat.android"],
    appStoreIds: ["447188370"],
    category: "social",
    icon: "👻",
    domains: ["snapchat.com"],
    defaultBlocked: true,
  },
  {
    appId: "netflix",
    name: "Netflix",
    packageNames: ["com.netflix.mediaclient"],
    appStoreIds: ["363590051"],
    category: "entertainment",
    icon: "🎬",
    domains: ["netflix.com"],
    defaultBlocked: true,
  },
  {
    appId: "whatsapp",
    name: "WhatsApp",
    packageNames: ["com.whatsapp"],
    appStoreIds: ["310633997"],
    category: "communication",
    icon: "💬",
    domains: ["whatsapp.com"],
    defaultBlocked: true,
  },
  {
    appId: "chrome",
    name: "Chrome",
    packageNames: ["com.android.chrome"],
    appStoreIds: ["535886823"],
    category: "productivity",
    icon: "🌐",
    domains: [],
    defaultBlocked: false,
  },
  {
    appId: "games",
    name: "Games",
    packageNames: [
      "com.roblox.client",
      "com.mojang.minecraftpe",
      "com.epicgames.fortnite",
      "com.valvesoftware.android.steam.community",
    ],
    appStoreIds: [],
    category: "gaming",
    icon: "🎮",
    domains: ["roblox.com", "minecraft.net", "epicgames.com", "steampowered.com", "fortnite.com"],
    defaultBlocked: true,
  },
  {
    appId: "discord",
    name: "Discord",
    packageNames: ["com.discord"],
    appStoreIds: ["1437348017"],
    category: "communication",
    icon: "💬",
    domains: ["discord.com", "discord.gg"],
    defaultBlocked: true,
  },
  {
    appId: "twitter",
    name: "X (Twitter)",
    packageNames: ["com.twitter.android"],
    appStoreIds: ["333903271"],
    category: "social",
    icon: "🐦",
    domains: ["x.com", "twitter.com"],
    defaultBlocked: true,
  },
  {
    appId: "reddit",
    name: "Reddit",
    packageNames: ["com.reddit.frontpage"],
    appStoreIds: ["1064216828"],
    category: "social",
    icon: "👽",
    domains: ["reddit.com"],
    defaultBlocked: true,
  },
  {
    appId: "twitch",
    name: "Twitch",
    packageNames: ["tv.twitch.android.app"],
    appStoreIds: ["613977567"],
    category: "gaming",
    icon: "📺",
    domains: ["twitch.tv"],
    defaultBlocked: true,
  },
  {
    appId: "pinterest",
    name: "Pinterest",
    packageNames: ["com.pinterest"],
    appStoreIds: ["429047995"],
    category: "social",
    icon: "📌",
    domains: ["pinterest.com"],
    defaultBlocked: false,
  },
  {
    appId: "telegram",
    name: "Telegram",
    packageNames: ["org.telegram.messenger"],
    appStoreIds: ["686449807"],
    category: "communication",
    icon: "✈️",
    domains: ["telegram.org"],
    defaultBlocked: false,
  },
  {
    appId: "spotify",
    name: "Spotify",
    packageNames: ["com.spotify.music"],
    appStoreIds: ["324684580"],
    category: "entertainment",
    icon: "🎵",
    domains: ["spotify.com"],
    defaultBlocked: false,
  },
  {
    appId: "snapchat",
    name: "Snapchat",
    packageNames: ["com.snapchat.android"],
    appStoreIds: ["447188370"],
    category: "social",
    icon: "👻",
    domains: ["snapchat.com"],
    defaultBlocked: true,
  },
  {
    appId: "messenger",
    name: "Messenger",
    packageNames: ["com.facebook.orca"],
    appStoreIds: ["454638411"],
    category: "communication",
    icon: "💬",
    domains: ["messenger.com"],
    defaultBlocked: false,
  },
  {
    appId: "zoom",
    name: "Zoom",
    packageNames: ["us.zoom.videomeetings"],
    appStoreIds: ["546505307"],
    category: "education",
    icon: "🎥",
    domains: ["zoom.us"],
    defaultBlocked: false,
  },
  {
    appId: "google_classroom",
    name: "Google Classroom",
    packageNames: ["com.google.android.apps.classroom"],
    appStoreIds: ["924620788"],
    category: "education",
    icon: "📚",
    domains: ["classroom.google.com"],
    defaultBlocked: false,
  },
  {
    appId: "khan_academy",
    name: "Khan Academy",
    packageNames: ["org.khanacademy.android"],
    appStoreIds: ["1369019850"],
    category: "education",
    icon: "📐",
    domains: ["khanacademy.org"],
    defaultBlocked: false,
  },
  {
    appId: "duolingo",
    name: "Duolingo",
    packageNames: ["com.duolingo"],
    appStoreIds: ["570060128"],
    category: "education",
    icon: "🦉",
    domains: ["duolingo.com"],
    defaultBlocked: false,
  },
];

export function getAppByAppId(appId: string): AppCatalogEntry | undefined {
  return APPLICATION_CATALOG.find((app) => app.appId === appId);
}

export function getAppByPackageName(packageName: string): AppCatalogEntry | undefined {
  return APPLICATION_CATALOG.find((app) => app.packageNames.includes(packageName));
}

export function getAppByDomain(domain: string): AppCatalogEntry | undefined {
  return APPLICATION_CATALOG.find((app) => app.domains.includes(domain));
}

export function getAppsByCategory(category: string): AppCatalogEntry[] {
  return APPLICATION_CATALOG.filter((app) => app.category === category);
}

export const CATEGORY_LABELS: Record<string, string> = {
  social: "Social Media",
  gaming: "Gaming",
  entertainment: "Entertainment",
  education: "Education",
  communication: "Communication",
  productivity: "Productivity",
  utility: "Utility",
  custom: "Custom",
};

export const CATEGORY_COLORS: Record<string, string> = {
  social: "text-red-400 bg-red-500/10",
  gaming: "text-orange-400 bg-orange-500/10",
  entertainment: "text-yellow-400 bg-yellow-500/10",
  education: "text-green-400 bg-green-500/10",
  communication: "text-blue-400 bg-blue-500/10",
  productivity: "text-purple-400 bg-purple-500/10",
  utility: "text-cyan-400 bg-cyan-500/10",
  custom: "text-slate-400 bg-slate-500/10",
};

