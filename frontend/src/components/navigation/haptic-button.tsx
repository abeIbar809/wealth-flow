import { PropsWithChildren } from "react";
import { TouchableOpacity } from "react-native";
import * as Haptics from 'expo-haptics';

export interface ElementButtonProps {
  onPressed: () => void;
}

export default function HapticButton({
  ...props
}: PropsWithChildren<ElementButtonProps>): React.JSX.Element {

  const onBtnPressed = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    props.onPressed()
  }

  return (
    <>
      <TouchableOpacity onPress={onBtnPressed}>
        {props.children}
      </TouchableOpacity>
    </>
  );
}
