import * as React from "react";
import { QuizTakingClient } from "./QuizTakingClient";

export default function PracticeQuizzesPage() {
  return (
    <React.Suspense fallback={null}>
      <QuizTakingClient />
    </React.Suspense>
  );
}
