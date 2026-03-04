 "use client";
 
import * as React from "react";
 import { StudentSettingsView } from "@/components/features/dashboard/StudentSettingsView";
 
export default function SettingsPage() {
  return (
    <React.Suspense fallback={null}>
      <StudentSettingsView />
    </React.Suspense>
  );
}
