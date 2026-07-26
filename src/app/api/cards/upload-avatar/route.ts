import { uploadCardAvatar } from "@/lib/composition-root";
import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { getWorkspaceAdminAuthorization } from "@/lib/workspace-admin-authorization.server";
import { AppError } from "@/lib/errors";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Uploads a card profile avatar.
 *
 * Delegates to the UploadCardAvatar use case, which verifies the editor
 * session, resolves the card's REAL workspace + customer, and stores the
 * asset against that workspace so the MediaFolder/MediaAsset foreign keys
 * to Workspace are satisfied.
 */
export async function POST(request: Request) {
  return handlePublicCardMutationRoute(request, async () => {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      throw new AppError("No file provided", 400, "NO_FILE");
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new AppError(
        "Only JPG, PNG, and WEBP files are supported",
        415,
        "UNSUPPORTED_MEDIA_TYPE",
      );
    }
    if (file.size > MAX_SIZE) {
      throw new AppError("File exceeds the 5MB limit", 413, "FILE_TOO_LARGE");
    }

    const cardId = form.get("cardId");
    const sessionToken = form.get("sessionToken");
    if (typeof cardId !== "string" || typeof sessionToken !== "string") {
      throw new AppError("Missing cardId or sessionToken", 400, "VALIDATION_ERROR");
    }

    const extension = (file.name.split(".").pop() || "bin").toLowerCase();
    const body = new Uint8Array(await file.arrayBuffer());

    const authorization = await getWorkspaceAdminAuthorization();
    const result = await uploadCardAvatar.execute(
      {
        cardId,
        sessionToken,
        fileName: file.name,
        contentType: file.type,
        byteSize: file.size,
        extension,
        body,
      },
      authorization,
    );

    return { data: result };
  });
}
