import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export function LogoutUser() {
  try {
    setTimeout(() => signOut({ redirect: true, callbackUrl: "/" }), 500);
    toast.success("Logout successful!");
  } catch (error) {
    console.log('error', error);
  }
  // try {
  //   const router = useRouter();
  //   router.push("/");
  // } catch (error) {
  //   window.location.replace('/');
  // }
}
