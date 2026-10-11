import { useLocation } from "preact-iso";

export function useNavbar() {
  const { route } = useLocation();

  function handleHomeClick() {
    route("/");
  }

  return { handleHomeClick };
}
