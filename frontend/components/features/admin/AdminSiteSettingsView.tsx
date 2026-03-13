"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Bell,
  Eye,
  EyeOff,
  FileImage,
  Globe,
  Link as LinkIcon,
  Loader2,
  Mail,
  MessageCircle,
  Palette,
  Plug,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

type SiteSettingsTab = "general" | "seo" | "branding" | "integration";

type SiteSettingsState = {
  general: {
    siteName: string;
    supportEmail: string;
    currency: "USD" | "EGP";
    social: { whatsapp: string; telegram: string; linkedin: string };
  };
  seo: {
    defaultPageTitle: string;
    defaultMetaDescription: string;
    ogImageDataUrl: string | null;
    sitemapEnabled: boolean;
    googleSearchConsoleVerification: string;
  };
  branding: {
    mainLogoDataUrl: string | null;
    faviconDataUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    typography: "lexend" | "manrope";
  };
  integration: {
    ga4Id: string;
    facebookPixelId: string;
    telegramBotToken: string;
    smtpHost: string;
    smtpPort: string;
    smtpEncryption: "TLS" | "SSL" | "None";
    smtpUsername: string;
    smtpPassword: string;
  };
};

const STORAGE_KEY = "yalla_admin_site_settings_v1";

const DEFAULT_STATE: SiteSettingsState = {
  general: {
    siteName: "Yalla CPHQ",
    supportEmail: "support@yallacphq.com",
    currency: "USD",
    social: { whatsapp: "", telegram: "", linkedin: "" },
  },
  seo: {
    defaultPageTitle: "Yalla CPHQ | The Premium Healthcare Platform",
    defaultMetaDescription:
      "Empowering healthcare quality professionals worldwide with the latest resources, training, and community engagement for CPHQ certification.",
    ogImageDataUrl: null,
    sitemapEnabled: true,
    googleSearchConsoleVerification: "",
  },
  branding: {
    mainLogoDataUrl: null,
    faviconDataUrl: null,
    primaryColor: "#D4AF37",
    secondaryColor: "#1A1A1A",
    typography: "lexend",
  },
  integration: {
    ga4Id: "",
    facebookPixelId: "",
    telegramBotToken: "",
    smtpHost: "",
    smtpPort: "587",
    smtpEncryption: "TLS",
    smtpUsername: "",
    smtpPassword: "",
  },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function mergeDefaults<T extends Record<string, unknown>>(defaults: T, maybe: unknown): T {
  if (!isObject(maybe)) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const k of Object.keys(defaults)) {
    const dv = defaults[k];
    const mv = maybe[k];
    if (isObject(dv)) out[k] = mergeDefaults(dv as Record<string, unknown>, mv);
    else if (mv !== undefined) out[k] = mv;
  }
  return out as T;
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none",
        "placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/40"
      )}
    />
  );
}

export function AdminSiteSettingsView() {
  const [tab, setTab] = React.useState<SiteSettingsTab>("general");
  const [state, setState] = React.useState<SiteSettingsState>(DEFAULT_STATE);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [showTelegramToken, setShowTelegramToken] = React.useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = React.useState(false);
  const mainLogoInputRef = React.useRef<HTMLInputElement | null>(null);
  const faviconInputRef = React.useRef<HTMLInputElement | null>(null);
  const ogImageInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      setState(mergeDefaults(DEFAULT_STATE as unknown as Record<string, unknown>, parsed) as SiteSettingsState);
    } catch {
      // ignore
    }
  }, []);

  const saveAll = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState(DEFAULT_STATE);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      setState(mergeDefaults(DEFAULT_STATE as unknown as Record<string, unknown>, parsed) as SiteSettingsState);
    } catch {
      setState(DEFAULT_STATE);
    }
  };

  const actionBar = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      {savedAt ? (
        <span className="inline-flex items-center gap-2 text-sm text-zinc-500 sm:mr-auto">
          <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          Saved {new Date(savedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : (
        <span className="sm:mr-auto" />
      )}
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-xl border-zinc-200 text-zinc-700"
        onClick={discard}
        disabled={saving}
      >
        Discard
      </Button>
      <Button
        type="button"
        className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
        onClick={() => void saveAll()}
        disabled={saving}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save Changes
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Site Settings
        </h1>
        <p className="text-sm text-zinc-600">
          Manage your global application preferences, brand identity, and external connections.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SiteSettingsTab)} className="space-y-6">
        <TabsList className="w-full justify-start rounded-none border-b border-zinc-200 bg-transparent p-0">
          <TabsTrigger
            value="general"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-zinc-500",
              "data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
            )}
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-zinc-500",
              "data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
            )}
          >
            SEO
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-zinc-500",
              "data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
            )}
          >
            Branding
          </TabsTrigger>
          <TabsTrigger
            value="integration"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-zinc-500",
              "data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
            )}
          >
            Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-5">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Settings} title="General Information" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Site Name
                  </Label>
                  <Input
                    value={state.general.siteName}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        general: { ...prev.general, siteName: e.target.value },
                      }))
                    }
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                    placeholder="Yalla CPHQ"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Support Email
                  </Label>
                  <Input
                    value={state.general.supportEmail}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        general: { ...prev.general, supportEmail: e.target.value },
                      }))
                    }
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                    placeholder="support@yallacphq.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Currency
                  </Label>
                  <Select
                    value={state.general.currency}
                    onValueChange={(v) =>
                      setState((prev) => ({
                        ...prev,
                        general: { ...prev.general, currency: v as SiteSettingsState["general"]["currency"] },
                      }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Search} title="SEO & Meta" />
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Page Title
                </Label>
                <Input
                  value={state.seo.defaultPageTitle}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, defaultPageTitle: e.target.value },
                    }))
                  }
                  className="h-11 rounded-xl border-zinc-200 bg-white"
                />
                <p className="text-xs text-zinc-500">Recommended length is 50–60 characters.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Meta Description
                </Label>
                <Textarea
                  value={state.seo.defaultMetaDescription}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, seo: { ...prev.seo, defaultMetaDescription: v } }))
                  }
                  rows={5}
                />
                <p className="text-xs text-zinc-500">Recommended length is 150–160 characters.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={LinkIcon} title="Social Media Links" />
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[160px_1fr] md:items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <MessageCircle className="h-4 w-4 text-zinc-400" aria-hidden />
                    WhatsApp
                  </div>
                  <Input
                    value={state.general.social.whatsapp}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          social: { ...prev.general.social, whatsapp: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://wa.me/..."
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-[160px_1fr] md:items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Bell className="h-4 w-4 text-zinc-400" aria-hidden />
                    Telegram
                  </div>
                  <Input
                    value={state.general.social.telegram}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          social: { ...prev.general.social, telegram: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://t.me/..."
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-[160px_1fr] md:items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Globe className="h-4 w-4 text-zinc-400" aria-hidden />
                    LinkedIn
                  </div>
                  <Input
                    value={state.general.social.linkedin}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          social: { ...prev.general.social, linkedin: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://linkedin.com/company/..."
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {actionBar}
        </TabsContent>

        <TabsContent value="seo" className="mt-0 space-y-5">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={SlidersHorizontal} title="Search Engine Optimization" />

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Default Page Title
                </Label>
                <Input
                  value={state.seo.defaultPageTitle}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, seo: { ...prev.seo, defaultPageTitle: e.target.value } }))
                  }
                  className="h-11 rounded-xl border-zinc-200 bg-white"
                />
                <p className="text-xs text-zinc-500">Recommended length: 50–60 characters.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Default Meta Description
                </Label>
                <Textarea
                  value={state.seo.defaultMetaDescription}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, seo: { ...prev.seo, defaultMetaDescription: v } }))
                  }
                  rows={5}
                />
                <p className="text-xs text-zinc-500">Recommended length: 150–160 characters.</p>
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                    <FileImage className="h-4 w-4 text-zinc-500" aria-hidden />
                    Social Sharing Image (OG Image)
                  </div>
                  <input
                    ref={ogImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await readFileAsDataUrl(file);
                      setState((prev) => ({ ...prev, seo: { ...prev.seo, ogImageDataUrl: dataUrl } }));
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-zinc-200"
                    onClick={() => ogImageInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  {state.seo.ogImageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={state.seo.ogImageDataUrl}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm text-zinc-500">
                      Upload a 1200×630 image
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 md:items-center">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">XML Sitemap Generation</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Automatically update sitemap.xml on content changes.
                    </p>
                  </div>
                  <Switch
                    checked={state.seo.sitemapEnabled}
                    onCheckedChange={(checked) =>
                      setState((prev) => ({ ...prev, seo: { ...prev.seo, sitemapEnabled: checked } }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Google Search Console Verification
                  </Label>
                  <Input
                    value={state.seo.googleSearchConsoleVerification}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, googleSearchConsoleVerification: e.target.value },
                      }))
                    }
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                    placeholder="gsc-xxxxxxxxxx"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {actionBar}
        </TabsContent>

        <TabsContent value="branding" className="mt-0 space-y-5">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Palette} title="Logo & Assets" />

              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      {state.branding.mainLogoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={state.branding.mainLogoDataUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500">
                          LOGO
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Main Logo</p>
                      <p className="text-sm text-zinc-500">Recommended size: 512×512px. SVG or PNG preferred.</p>
                    </div>
                  </div>
                  <input
                    ref={mainLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await readFileAsDataUrl(file);
                      setState((prev) => ({ ...prev, branding: { ...prev.branding, mainLogoDataUrl: dataUrl } }));
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                    onClick={() => mainLogoInputRef.current?.click()}
                  >
                    Upload
                  </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      {state.branding.faviconDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={state.branding.faviconDataUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500">
                          F
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Favicon</p>
                      <p className="text-sm text-zinc-500">Format: .ico or 32×32px .png</p>
                    </div>
                  </div>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await readFileAsDataUrl(file);
                      setState((prev) => ({ ...prev, branding: { ...prev.branding, faviconDataUrl: dataUrl } }));
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-zinc-200"
                    onClick={() => faviconInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Palette} title="Brand Colors" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Primary color</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={state.branding.primaryColor}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))
                      }
                      className="h-10 w-10 rounded-xl border border-zinc-200 bg-white p-1"
                      aria-label="Primary color"
                    />
                    <Input
                      value={state.branding.primaryColor}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))
                      }
                      className="h-10 rounded-xl border-zinc-200 bg-white"
                    />
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    Used for buttons, active tabs, and primary highlights.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Secondary color</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={state.branding.secondaryColor}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, secondaryColor: e.target.value },
                        }))
                      }
                      className="h-10 w-10 rounded-xl border border-zinc-200 bg-white p-1"
                      aria-label="Secondary color"
                    />
                    <Input
                      value={state.branding.secondaryColor}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, secondaryColor: e.target.value },
                        }))
                      }
                      className="h-10 rounded-xl border-zinc-200 bg-white"
                    />
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    Used for footers, backgrounds, and contrasting elements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Palette} title="Typography" />

              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    { id: "lexend", title: "Lexend", subtitle: "Designed to reduce visual stress and improve reading speed." },
                    { id: "manrope", title: "Manrope", subtitle: "Modern, geometric sans-serif font family." },
                  ] as const
                ).map((opt) => {
                  const active = state.branding.typography === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, branding: { ...prev.branding, typography: opt.id } }))}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        active ? "border-gold/40 bg-gold/10" : "border-zinc-200 bg-white hover:bg-zinc-50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">{opt.title}</p>
                          <p className="mt-0.5 text-sm text-zinc-500">{opt.subtitle}</p>
                        </div>
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full border",
                            active ? "border-gold bg-gold" : "border-zinc-300 bg-white"
                          )}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-6">
                        <p className="text-lg font-semibold text-zinc-900">The quick brown fox</p>
                        <p className="mt-2 text-sm text-zinc-600">
                          Jumps over the lazy dog.
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {actionBar}
        </TabsContent>

        <TabsContent value="integration" className="mt-0 space-y-5">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Plug} title="Tracking & Analytics" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Google Analytics 4 (GA4) ID
                  </Label>
                  <Input
                    value={state.integration.ga4Id}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, integration: { ...prev.integration, ga4Id: e.target.value } }))
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Facebook Pixel ID
                  </Label>
                  <Input
                    value={state.integration.facebookPixelId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        integration: { ...prev.integration, facebookPixelId: e.target.value },
                      }))
                    }
                    placeholder="123456789012345"
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={MessageCircle} title="Messaging Platforms" />
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <MessageCircle className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">WhatsApp Business API</p>
                      <p className="text-sm text-zinc-500">Connect your verified business account</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    Connect Account
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Telegram Bot Token
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={state.integration.telegramBotToken}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          integration: { ...prev.integration, telegramBotToken: e.target.value },
                        }))
                      }
                      type={showTelegramToken ? "text" : "password"}
                      placeholder="123456789:ABCDefG..."
                      className="h-11 rounded-xl border-zinc-200 bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-11 rounded-xl border-zinc-200"
                      onClick={() => setShowTelegramToken((v) => !v)}
                      aria-label={showTelegramToken ? "Hide token" : "Show token"}
                    >
                      {showTelegramToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">Obtain this token from @BotFather on Telegram.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <SectionHeader icon={Mail} title="SMTP Email Settings" />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    SMTP Host
                  </Label>
                  <Input
                    value={state.integration.smtpHost}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, integration: { ...prev.integration, smtpHost: e.target.value } }))
                    }
                    placeholder="smtp.provider.com"
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Port
                  </Label>
                  <Input
                    value={state.integration.smtpPort}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, integration: { ...prev.integration, smtpPort: e.target.value } }))
                    }
                    placeholder="587"
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Encryption
                  </Label>
                  <Select
                    value={state.integration.smtpEncryption}
                    onValueChange={(v) =>
                      setState((prev) => ({
                        ...prev,
                        integration: { ...prev.integration, smtpEncryption: v as SiteSettingsState["integration"]["smtpEncryption"] },
                      }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TLS">TLS</SelectItem>
                      <SelectItem value="SSL">SSL</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Username
                  </Label>
                  <Input
                    value={state.integration.smtpUsername}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        integration: { ...prev.integration, smtpUsername: e.target.value },
                      }))
                    }
                    placeholder="user@domain.com"
                    className="h-11 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Password
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={state.integration.smtpPassword}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          integration: { ...prev.integration, smtpPassword: e.target.value },
                        }))
                      }
                      type={showSmtpPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 rounded-xl border-zinc-200 bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-11 rounded-xl border-zinc-200"
                      onClick={() => setShowSmtpPassword((v) => !v)}
                      aria-label={showSmtpPassword ? "Hide password" : "Show password"}
                    >
                      {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-100" />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-zinc-200 text-zinc-700"
                >
                  Test Connection
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                  onClick={() => void saveAll()}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save All Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {actionBar}
        </TabsContent>
      </Tabs>
    </div>
  );
}

