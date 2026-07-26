"use client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, EmptyState } from "@/design/components";
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }){return <EmptyState actions={<Button leftIcon={<RotateCcw/>} onClick={reset}>Try again</Button>} description={error.digest ? `The request failed. Reference ${error.digest}.` : "The request failed. No write operation was attempted."} icon={<AlertTriangle/>} title="Unable to load this page"/>}
