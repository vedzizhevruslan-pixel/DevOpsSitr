import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
