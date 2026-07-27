import app from "../server/index.mjs";

export default function handler(request, response) {
  const url = new URL(request.url ?? "/", "http://localhost");
  const path = url.searchParams.get("__path") ?? "";
  url.searchParams.delete("__path");
  const query = url.searchParams.toString();
  request.url = `/api/${path}${query ? `?${query}` : ""}`;
  return app(request, response);
}
