import { cookies } from 'next/headers';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './_components/app-sidebar';
import { getAccessToken } from '@/lib/auth/auth-cookies';
import { decodeJwtPayload } from '@/lib/auth/jwt-payload';
import AgentPublishButton from './agents/_components/agent-publish-button';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';

export default async function CoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value;
  const defaultOpen = cookieValue ? cookieValue === 'true' : true;

  const accessToken = await getAccessToken();
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const username = typeof payload?.username === 'string' ? payload.username : undefined;
  const email = typeof payload?.email === 'string' ? payload.email : undefined;
  const userId =
    typeof payload?.userId === 'string'
      ? payload.userId
      : typeof payload?.sub === 'string'
        ? payload.sub
        : undefined;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={{ username, email, userId }} />
      <main className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-white/10 bg-black/20 px-4 text-white/90 backdrop-blur">
          <SidebarTrigger
            variant="ghost"
            size="icon"
            className="border border-white/10 bg-white/5 hover:bg-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Reacherr</p>
          </div>

          <AgentPublishButton />
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
}
