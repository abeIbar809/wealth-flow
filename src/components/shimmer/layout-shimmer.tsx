import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { ShimmerLayout, ShimmerLayoutContainerType } from "react-native-gradient-shimmer";

const layoutExample: ShimmerLayoutContainerType = {
  content: [
    {
      flexDirection: 'row',

      content: [
        {
          height: 150,
          width: 100,
          marginRight: 16,
        },
        {
          justifyContent: 'space-between',
          content: [
            {
              height: 40,
              width: 250,
            },
            {
              height: 40,
              width: 250,
            },
            {
              height: 40,
              width: 120,
            },
          ],
        },
      ],
    },
    {
      marginTop: 16,
      flexDirection: 'row',
      columnGap: 16,
      content: [
        {
          width: 100,
          height: 100,
        },
        {
          width: 100,
          height: 100,
        },
        {
          width: 100,
          height: 100,
        },
        {
          width: 100,
          height: 100,
        },
        {
          width: 100,
          height: 100,
        },
      ],
    },
  ],
};


const layoutExample2: ShimmerLayoutContainerType = {
  content:[
    {
      width:350,
      height:200,
      content:[
        {
          flexDirection: "row",
          justifyContent: "center",
          content: [
            {
              width:50,
             height:50,

            }

          ]
        }
      ]
    }
  ]
};

export const ShimmerLayoutExample = () => {
  const horizontalMargin = 16;

  return (
    <View
      style={{
        marginHorizontal: horizontalMargin,
      }}>
      <ShimmerLayout
        LinearGradientComponent={LinearGradient}
        layout={layoutExample2}
        defaultShimmerProps={{
          style: {
            borderRadius: 8,
          },
        }}
      />
    </View>
  );
};
