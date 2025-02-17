import { Login } from "@/api/auth";
import { NavigationPaths } from "./navigation";
import Cookies from "js-cookie";

export const doLogin = async (email: string, password: string, navigate: (path: string) => void) => {
  const data = await Login(email, password)
  localStorage.setItem('ca_token', data.token)
  localStorage.setItem('ca_expiration', data.expiration)

  const redirectUrl = Cookies.get('ca_redirect')
  if (redirectUrl) {
    Cookies.remove('ca_redirect')
    navigate(redirectUrl)
  } else {
    navigate(NavigationPaths.MyTasks)
  }
}
