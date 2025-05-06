import LoginPage from "@/components/login-page"

export default function Home() {
  // In a real implementation, you would check server-side if the user is authenticated
  // For now, we'll redirect to the main page if they're logged in
  // This is just a placeholder - the actual auth check will happen in the login component

  return <LoginPage />
}
