import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconProps as BaseIconProps,
} from "@tabler/icons-react";

const iconMap = {
  success: IconCircleCheckFilled,
  failed: IconCircleXFilled,
};

export type IconNames = keyof typeof iconMap;

export type IconProps = BaseIconProps & {
  name: IconNames;
};

export const Icon = (props: IconProps) => {
  const { name, ...rest } = props;
  const IconComponent = iconMap[name];
  return <IconComponent {...rest} />;
};
