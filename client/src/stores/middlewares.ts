import { rootApi } from "@/services/root-api"
import { logOut } from "./slices/auth-slice"
import { persistor } from "./store";

export const logOuMiddleware = (store) => (next) => (action) => {
  if (action.type === logOut.type) {
    store.dispatch(rootApi.util.resetApiState());
    persistor.purge();
  }

  return next(action);
}