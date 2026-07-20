
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  cardsQuerySchema,
  deleteCardQuerySchema,
  businessCardCreateSchema,
  businessCardUpdateSchema
} from "@/lib/validation/business-card";
import { errorResponse, validationErrorResponse } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { legacyCardService } from "@/lib/composition-root";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || undefined;

    const queryResult = cardsQuerySchema.safeParse({ id });
    if (!queryResult.success) {
      return validationErrorResponse(
        queryResult.error.flatten().fieldErrors,
        "Invalid query parameters"
      );
    }

    if (id) {
      const card = await legacyCardService.get(id, session.user.id);
      return NextResponse.json(card);
    }

    const cards = await legacyCardService.list(session.user.id);
    return NextResponse.json(cards);
  } catch (error) {
    console.error("[CARDS_GET]", error);
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode, error.code);
    }
    return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const body = await req.json();
    const id = body.id || undefined;

    const validationResult = id
      ? businessCardUpdateSchema.safeParse(body)
      : businessCardCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(
        validationResult.error.flatten().fieldErrors,
        "Validation failed"
      );
    }

    const validatedData = validationResult.data;

    if (id) {
      const updated = await legacyCardService.update(id, validatedData, session.user.id);
      return NextResponse.json(updated);
    } else {
      const created = await legacyCardService.create(validatedData, session.user.id);
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("[CARDS_POST]", error);
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode, error.code);
    }
    if (error.code === "P2002") {
      return errorResponse("A card with this slug or hash already exists", 409, "CONFLICT");
    }
    return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || undefined;

    const queryResult = deleteCardQuerySchema.safeParse({ id });
    if (!queryResult.success) {
      return validationErrorResponse(
        queryResult.error.flatten().fieldErrors,
        "Missing or invalid card ID"
      );
    }

    await legacyCardService.delete(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CARDS_DELETE]", error);
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode, error.code);
    }
    return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
  }
}
