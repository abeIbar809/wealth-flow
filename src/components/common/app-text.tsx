import { TextStyles, TextStyleType } from "@/src/constants/text";
import { Text, TextStyle, type TextProps } from "react-native";

export type Props = TextProps & {
    type?: TextStyleType
};

namespace TextTypes {

    type Props = TextProps & {};

    export function Caption({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.caption as TextStyle, rest.style]} />
        );
    }

    export function Normal({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.normal as TextStyle, rest.style]} />
        );
    }

    export function Default({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.default as TextStyle, rest.style]} />
        );
    }

    export function Title({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.title as TextStyle, rest.style]} />
        );
    }

    export function SubTitle({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.subtitle as TextStyle, rest.style]} />
        );
    }

    export function TitleNormal({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.titleNormal as TextStyle, rest.style]} />
        );
    }

    export function SubTitleNormal({ ...rest }: Props) {
        return (
            <Text allowFontScaling={false} {...rest} style={[TextStyles.subtitleNormal as TextStyle, rest.style]} />
        );
    }

    export function Unscaled({ ...rest }: TextProps) {
        return (
            <Text allowFontScaling={false} {...rest} />
        );
    }
}

export function AppText({ style, type = "default", ...rest }: Props) {
    return (
        <Text
            allowFontScaling={false}
            {...rest}
            style={[
                type === "default" ? TextStyles.default as TextStyle : undefined,
                type === "title" ? TextStyles.title as TextStyle : undefined,
                type === "normal" ? TextStyles.normal as TextStyle : undefined,
                type === "defaultSemiBold" ? TextStyles.defaultSemiBold as TextStyle : undefined,
                type === "subtitle" ? TextStyles.subtitle as TextStyle : undefined,
                type === "link" ? TextStyles.link as TextStyle : undefined,
                type == "subtitleNormal" ? TextStyles.subtitleNormal as TextStyle : undefined,
                type === "titleNormal" ? TextStyles.titleNormal as TextStyle : undefined,
                type === "caption" ? TextStyles.caption as TextStyle : undefined,
                style,
            ]}
        />
    );
}

AppText.Caption = TextTypes.Caption
AppText.Defualt = TextTypes.Default
AppText.Normal = TextTypes.Normal
AppText.SubTitle = TextTypes.SubTitle
AppText.SubTitleNormal = TextTypes.SubTitleNormal
AppText.Title = TextTypes.Title
AppText.TitleNormal = TextTypes.TitleNormal
AppText.Unscaled = TextTypes.Unscaled




