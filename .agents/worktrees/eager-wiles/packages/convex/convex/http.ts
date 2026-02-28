import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth/client";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

export default http;
