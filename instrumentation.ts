export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const newLocal = "./instrumentation-node";
    await import(newLocal);
  }
}
