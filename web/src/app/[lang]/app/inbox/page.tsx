import { Suspense } from "react";
import { Inbox } from "@/components/dash/inbox";

// The selected conversation comes from ?c=, read on the client inside Suspense.
export default function Page() {
  return (
    <Suspense>
      <Inbox />
    </Suspense>
  );
}
