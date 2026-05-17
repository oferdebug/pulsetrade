import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

type AppShellProps={
    children:React.ReactNode;
};

export default function AppShell({children}:AppShellProps) {
  return (
    <div className={'min-h-screen bg-slate-950 text-slate-100'}>
        <div className={'flex min-h-screen'}>
            <AppSidebar />
            <div className={'flex min-w-0 flex-1 flex-col'}>
                <AppTopbar />
                <main className={'flex-1 p-6'}>
                    {children}
                </main>
            </div>
        </div>
    </div>
  );
};
