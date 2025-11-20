import { HostPage } from "./HostPage";
import { ClientPage } from "./ClientPage";

export function Demo() {
  const path = window.location.pathname;

  if (path === "/client") {
    return <ClientPage />;
  }

  if (path === "/host" || path === "/") {
    return <HostPage />;
  }

  // Fallback to host page
  return <HostPage />;
}
