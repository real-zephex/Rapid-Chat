"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function CouncilPage() {
  const router = useRouter();

  useEffect(() => {
    const id = uuidv4();
    router.replace(`/council/${id}`);
  }, [router]);

  return null;
}
