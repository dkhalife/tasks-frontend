import { Login } from "@/api/auth";
import { goTo, goToMyTasks } from "./navigation";
import Cookies from "js-cookie";

export const doLogin = async (email: string, password: string) => {
  const data = await Login(email, password)
  localStorage.setItem('ca_token', data.token)
  localStorage.setItem('ca_expiration', data.expiration)

  const redirectUrl = Cookies.get('ca_redirect')
  if (redirectUrl) {
    Cookies.remove('ca_redirect')
    goTo(redirectUrl)
  } else {
    goToMyTasks()
  }
}
