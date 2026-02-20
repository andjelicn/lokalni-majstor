import Header from "./header";
import Footer from "./footer";
import { Outlet } from "react-router-dom";

export default function LayOutWithHeader() {

    return (
        <div className="min-h-dvh flex flex-col bg-slate-100 text-slate-950 dark:bg-slate-50 dark:text-black">
            <Header />
            <main className="flex-1 px-4 py-4 sm:px-6">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}