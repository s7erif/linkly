import { NextResponse } from "next/server";

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
  }, { status });
}

export function errorResponse(message: string, status: number = 500, code: string = "INTERNAL_ERROR") {
  return NextResponse.json({
    success: false,
    message,
    code,
  }, { status });
}

export function validationErrorResponse(details: any, message: string = "Validation failed") {
  return NextResponse.json({
    success: false,
    message,
    code: "VALIDATION_ERROR",
    details,
  }, { status: 400 });
}
