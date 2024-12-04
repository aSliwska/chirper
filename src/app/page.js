"use client";

import { redirect } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
  redirect((user !== null) ? '/dashboard' : '/login');
}
