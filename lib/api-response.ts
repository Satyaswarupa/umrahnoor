import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function validationErrorResponse(error: ZodError) {
  const firstIssue = error.issues[0];
  return errorResponse(firstIssue?.message ?? "Invalid input", 400);
}

export function unauthorizedResponse() {
  return errorResponse("Authentication required", 401);
}

export function forbiddenResponse() {
  return errorResponse("You do not have permission to perform this action", 403);
}

export function notFoundResponse(message = "Not found") {
  return errorResponse(message, 404);
}

export function serverErrorResponse() {
  return errorResponse("Something went wrong. Please try again.", 500);
}
