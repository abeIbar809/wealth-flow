import { PropsWithChildren } from "react";
import { TouchableOpacity } from "react-native";

export interface ElementButtonProps {
  onPressed: () => void;
}
export default function ElementButton({
  ...props
}: PropsWithChildren<ElementButtonProps>): React.JSX.Element {
  return (
    <>
      <TouchableOpacity onPress={props.onPressed}>
        {props.children}
      </TouchableOpacity>
    </>
  );
}
