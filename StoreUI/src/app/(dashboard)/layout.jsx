import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/users";
import SideNav from "@/components/admin/SideNav/sidenav";
import "@/styles/bootstrap.ltr.css";
import "./global.css";


export default async function Layout({children}) {
  const session = await getServerSession(authOptions);
  
  console.log("🔒 [Debug] Admin Layout Access Attempt:", {
    email: session?.user?.email,
    role: session?.user?.role,
  });

  if (!session) {
    redirect("/signin");
  }
  if (session.user.role?.toUpperCase() === "USER") {
    redirect("/my-account");
  }
  
  return (
    <main className="sa-app sa-app--desktop-sidebar-shown sa-app--mobile-sidebar-hidden sa-app--toolbar-fixed">
      <SideNav />
      <div className="sa-app__content">
        <div className="sa-app__body px-2 px-lg-4">
            {children}
        </div>
      </div>
    </main>
  );
}
