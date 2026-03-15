const BASE = "http://localhost:8000";

export async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function postForm(path, formData) {
  const res = await fetch(BASE + path, { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function del(path) {
  const res = await fetch(BASE + path, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
