export type ActivationAccountRecord = {
  id: string;
  customerId: string;
  displayName?: string;
  email: string;
  passwordHash: Uint8Array<ArrayBuffer>;
  passwordSalt: Uint8Array<ArrayBuffer>;
  workspace: {
    id: string;
    primaryCardId: string | null;
    cards?: readonly { id: string; name: string; slug: string }[];
    pendingActivationTokens?: readonly string[];
  } | null;
};

export type ActivationResult = {
  activationId: string;
  customerId: string;
  cardId: string;
  slug: string;
  customerCreated: boolean;
  workspaceCreated: boolean;
  firstCard: boolean;
};

export type CustomerCardSessionRecord = {
  cardId: string;
  slug: string;
};
