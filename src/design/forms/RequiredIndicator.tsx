import { Text } from "../primitives";

export type RequiredIndicatorProps = {
  optional?: boolean;
};

export function RequiredIndicator({ optional = false }: RequiredIndicatorProps) {
  return (
    <Text aria-hidden={optional ? undefined : true} as="span" tone="muted" variant="caption">
      {optional ? "Optional" : "*"}
    </Text>
  );
}
