import { redirect } from "next/navigation";

/**  Root path – temporary redirect while we have no marketing homepage.   */
export default function RootPage() {
  redirect("/login");          // Later we can change this to "/dashboard" or real homepage
}
