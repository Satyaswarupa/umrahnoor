import mongoose, { type Schema } from "mongoose";

// Next.js dev re-executes a server module (like a models/*.ts file) on the
// next request after it's edited, but Mongoose's `mongoose.models` registry
// is a singleton that survives that re-execution across the whole process.
// The usual `models.X || model("X", schema)` guard then keeps returning the
// OLD compiled schema forever after any edit — new/renamed/changed fields
// are silently ignored (Mongoose strips undeclared fields on save) until the
// entire dev server is restarted, which is easy to not realize is needed.
//
// Outside production, drop the stale registry entry before checking it, so
// a schema edit takes effect on the very next request instead of requiring
// a restart. In production each process only ever compiles a given model
// once anyway, so this never fires there.
export function registerModel(name: string, schema: Schema) {
  if (process.env.NODE_ENV !== "production" && mongoose.models[name]) {
    delete mongoose.models[name];
  }
  return mongoose.models[name] || mongoose.model(name, schema);
}
