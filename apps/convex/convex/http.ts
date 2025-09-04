import { httpRouter } from "convex/server";
import {clerkUserHandler} from "./webhook/clerk";

const http = httpRouter();

http.route({
  path: "/webhook/clerk",
  method: "POST",
  handler: clerkUserHandler,
});

export default http;
