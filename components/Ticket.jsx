import React, { createContext, useContext } from "react";
import { View, Animated } from "react-native";

const TicketContext = createContext({
  borderColor: null,
  backgroundColor: "rgb(248, 250, 252)",
  screenBackgroundColor: "#E3F2FD",
  semicircleRadius: 16,
  padding: 24,
});

export default function Ticket({
  children,
  borderColor = null,
  backgroundColor = "rgb(248, 250, 252)",
  screenBackgroundColor = "#E3F2FD",
  perforationRadius = 5,
  cornerRadius = 16,
  semicircleRadius = 16,
  padding = 24,
  numPerforations = 18,
  topTicketView = null,
  bottomTicketView = null,
  dividerAccessory = null,
  dividerLeftAccessory = null,
  cornerType = "cutout", // "cutout" | "curved"
  style = {},
  className = "",
  ...props
}) {
  const perfDiameter = perforationRadius * 2;

  return (
    <TicketContext.Provider
      value={{
        borderColor,
        backgroundColor,
        screenBackgroundColor,
        semicircleRadius,
        padding,
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor,
            position: "relative",
            borderRadius: cornerType === "curved" ? cornerRadius : 0,
            padding,
          },
          style,
        ]}
        className={className}
        {...props}
      >
        {/* Border Layer - Rendered behind everything so cutouts can mask it */}
        {borderColor && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: cornerType === "curved" ? cornerRadius : 0,
              borderWidth: 1,
              borderColor: borderColor,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
        )}

        {/* Top Perforated Edge - Solid Mask Layer */}
        <View
          style={{
            position: "absolute",
            top: -perforationRadius,
            left: cornerRadius + 4,
            right: cornerRadius + 4,
            height: perfDiameter,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {Array.from({ length: numPerforations }).map((_, i) => (
            <View
              key={i}
              style={{
                width: perfDiameter,
                height: perfDiameter,
                borderRadius: perforationRadius,
                backgroundColor: screenBackgroundColor,
              }}
            />
          ))}
        </View>

        {/* Top Perforated Edge - Clipped Border Layer */}
        {borderColor && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: cornerRadius + 4,
              right: cornerRadius + 4,
              height: perforationRadius,
              overflow: "hidden",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {Array.from({ length: numPerforations }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: perfDiameter,
                  height: perfDiameter,
                  borderRadius: perforationRadius,
                  borderWidth: 1,
                  borderColor: borderColor,
                  marginTop: -perforationRadius,
                }}
              />
            ))}
          </View>
        )}

        {/* Ticket Corner Cutouts */}
        {cornerType === "cutout" && (
          <>
            {/* Top-Left Corner */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: cornerRadius,
                height: cornerRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: cornerRadius * 2,
                  height: cornerRadius * 2,
                  borderRadius: cornerRadius,
                  backgroundColor: screenBackgroundColor,
                  borderWidth: borderColor ? 1 : 0,
                  borderColor: borderColor || "transparent",
                  position: "absolute",
                  top: -cornerRadius,
                  left: -cornerRadius,
                }}
              />
            </View>
     
            {/* Top-Right Corner */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: cornerRadius,
                height: cornerRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: cornerRadius * 2,
                  height: cornerRadius * 2,
                  borderRadius: cornerRadius,
                  backgroundColor: screenBackgroundColor,
                  borderWidth: borderColor ? 1 : 0,
                  borderColor: borderColor || "transparent",
                  position: "absolute",
                  top: -cornerRadius,
                  right: -cornerRadius,
                }}
              />
            </View>
     
            {/* Bottom-Left Corner */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: cornerRadius,
                height: cornerRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: cornerRadius * 2,
                  height: cornerRadius * 2,
                  borderRadius: cornerRadius,
                  backgroundColor: screenBackgroundColor,
                  borderWidth: borderColor ? 1 : 0,
                  borderColor: borderColor || "transparent",
                  position: "absolute",
                  bottom: -cornerRadius,
                  left: -cornerRadius,
                }}
              />
            </View>
     
            {/* Bottom-Right Corner */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: cornerRadius,
                height: cornerRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: cornerRadius * 2,
                  height: cornerRadius * 2,
                  borderRadius: cornerRadius,
                  backgroundColor: screenBackgroundColor,
                  borderWidth: borderColor ? 1 : 0,
                  borderColor: borderColor || "transparent",
                  position: "absolute",
                  bottom: -cornerRadius,
                  right: -cornerRadius,
                }}
              />
            </View>
          </>
        )}

        {/* Render Content */}
        {topTicketView || bottomTicketView ? (
          <>
            {topTicketView}
            <Ticket.Divider rightAccessory={dividerAccessory} leftAccessory={dividerLeftAccessory} />
            {bottomTicketView}
          </>
        ) : (
          children
        )}

        {/* Bottom Perforated Edge - Solid Mask Layer */}
        <View
          style={{
            position: "absolute",
            bottom: -perforationRadius,
            left: cornerRadius + 4,
            right: cornerRadius + 4,
            height: perfDiameter,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {Array.from({ length: numPerforations }).map((_, i) => (
            <View
              key={i}
              style={{
                width: perfDiameter,
                height: perfDiameter,
                borderRadius: perforationRadius,
                backgroundColor: screenBackgroundColor,
              }}
            />
          ))}
        </View>

        {/* Bottom Perforated Edge - Clipped Border Layer */}
        {borderColor && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: cornerRadius + 4,
              right: cornerRadius + 4,
              height: perforationRadius,
              overflow: "hidden",
              flexDirection: "row",
              justifyContent: "space-between",
              transform: [{ scaleY: -1 }],
              backgroundColor: "rgba(0, 0, 0, 0.01)",
              borderRadius: 0.5,
            }}
          >
            {Array.from({ length: numPerforations }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: perfDiameter,
                  height: perfDiameter,
                  borderRadius: perforationRadius,
                  borderWidth: 1,
                  borderColor: borderColor,
                  marginTop: -perforationRadius,
                }}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </TicketContext.Provider>
  );
}

function TicketDivider({ style = {}, lineStyle = {}, rightAccessory = null, leftAccessory = null, ...props }) {
  const {
    borderColor,
    screenBackgroundColor,
    semicircleRadius,
    padding,
  } = useContext(TicketContext);

  const punchWidth = semicircleRadius + 1;
  const punchHeight = semicircleRadius * 2;

  return (
    <View
      style={[
        {
          position: "relative",
          marginVertical: 8,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      {...props}
    >
      {/* Dashed line */}
      <View
        style={[
          {
            width: "100%",
            height: 1,
            overflow: "hidden",
          },
          lineStyle,
        ]}
      >
        <View
          style={{
            width: "100%",
            height: 2,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: borderColor || "#94a3b8",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </View>

      {/* Left semicircular punch */}
      <View
        style={{
          width: semicircleRadius,
          height: punchHeight,
          position: "absolute",
          left: -padding,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: semicircleRadius * 2,
            height: punchHeight,
            borderRadius: semicircleRadius,
            backgroundColor: screenBackgroundColor,
            borderWidth: borderColor ? 1 : 0,
            borderColor: borderColor || "transparent",
            position: "absolute",
            left: -semicircleRadius,
          }}
        />
      </View>
 
      {/* Right semicircular punch */}
      <View
        style={{
          width: semicircleRadius,
          height: punchHeight,
          position: "absolute",
          right: -padding,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: semicircleRadius * 2,
            height: punchHeight,
            borderRadius: semicircleRadius,
            backgroundColor: screenBackgroundColor,
            borderWidth: borderColor ? 1 : 0,
            borderColor: borderColor || "transparent",
            position: "absolute",
            left: 0,
          }}
        />
      </View>

      {/* Custom Right Accessory */}
      {rightAccessory && (
        <View style={{ position: "absolute", right: -padding - 16, top: -14, zIndex: 100 }}>
          {rightAccessory}
        </View>
      )}

      {/* Custom Left Accessory */}
      {leftAccessory && (
        <View style={{ position: "absolute", left: -padding - 16, top: -14, zIndex: 100 }}>
          {leftAccessory}
        </View>
      )}
    </View>
  );
}

// Attach Divider as static property
Ticket.Divider = TicketDivider;
