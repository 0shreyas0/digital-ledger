import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, {
  useState, useEffect,
  useCallback, useMemo, useRef,
} from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, {
  Path, Defs, LinearGradient, Stop,
  Circle, G, Line, Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Animated primitives
// ---------------------------------------------------------------------------
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine   = Animated.createAnimatedComponent(Line);

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const Y_AXIS_W = 44;
const P_T      = 20;
const P_B      = 32;
const P_L      = 6;
const P_R      = 16;

const Y_TICKS     = 5;
const MAX_X_TICKS = 8;
const ANIM        = { snap: 130, pop: 160, settle: 55 };
const TT_W        = 180;
const TT_H        = 30;
const DOT_R       = { normal: 4, active: 6 };

// ---------------------------------------------------------------------------
// Dummy data
// ---------------------------------------------------------------------------
const DUMMY_DATA = [
  { x: 0,  y: 1000 }, { x: 1,  y: 1200 }, { x: 2,  y: 1150 },
  { x: 3,  y: 1400 }, { x: 4,  y: 1350 }, { x: 5,  y: 1600 },
  { x: 6,  y: 1750 }, { x: 7,  y: 1700 }, { x: 8,  y: 1900 },
  { x: 9,  y: 2100 }, { x: 10, y: 2050 }, { x: 11, y: 2300 },
  { x: 12, y: 2500 },
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Catmull-Rom → cubic Bézier */
function buildPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].px},${pts[0].py}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.px + (p2.px - p0.px) / 6;
    const cp1y = p1.py + (p2.py - p0.py) / 6;
    const cp2x = p2.px - (p3.px - p1.px) / 6;
    const cp2y = p2.py - (p3.py - p1.py) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.px},${p2.py}`;
  }
  return d;
}

function buildTheme(isDark) {
  return {
    primary:  isDark ? '#60a5fa' : '#5b8cf5',
    dotFill:  isDark ? '#1e293b' : '#ffffff',
    grid:     isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    axis:     isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.18)',
    label:    isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
  };
}

/** Closest mapped point to a given x in content coordinates */
function closestPoint(mapped, x) {
  let best = null, minD = Infinity;
  for (const p of mapped) {
    const d = Math.abs(p.px - x);
    if (d < minD) { minD = d; best = p; }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const GraphDot = React.memo(({ p, theme }) => (
  <Circle
    cx={p.px} cy={p.py} r={DOT_R.normal}
    fill={theme.dotFill} stroke={theme.primary} strokeWidth="2"
  />
));
GraphDot.displayName = 'GraphDot';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * @param {object[]} data     – Array of { x: number|string, y: number }
 * @param {number}   width    – Component width in px
 * @param {number}   height   – Chart height in px
 * @param {string}   currency – Prefix shown in tooltip (default "₹")
 * @param {string}   xLabel   – Label below x-axis
 * @param {string}   yLabel   – Label above chart
 */
export default function Graph({
  data     = DUMMY_DATA,
  width    = 350,
  height   = 240,
  currency = '₹',
  xLabel   = '',
  yLabel   = '',
}) {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => buildTheme(colorScheme === 'dark'), [colorScheme]);

  const PLOT_VIEW_W = width - Y_AXIS_W;
  const IH          = height - P_T - P_B;
  const IW          = PLOT_VIEW_W  - P_L - P_R;

  // ── Tooltip / selection ──────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState(null);
  const lastPointRef = useRef(null);
  if (tooltip) lastPointRef.current = tooltip;
  const displayPoint = tooltip ?? lastPointRef.current;

  const activeX = useSharedValue(-9999);
  const activeY = useSharedValue(-9999);
  const ttScale = useSharedValue(0);
  const prevTT  = useRef(null);

  // ── Data mapping ──────────────────────────────────────────────────────────
  const { mapped, yTicks } = useMemo(() => {
    const xs = data.map(p => p.x), ys = data.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const padY = (maxY - minY) * 0.12 || 100;
    const lo = minY - padY, hi = maxY + padY;

    const sx = x => P_L + ((x - minX) / (maxX - minX || 1)) * IW;
    const sy = y => P_T + IH - ((y - lo)  / (hi - lo   || 1)) * IH;

    const mapped = data.map((p, i) => ({ ...p, index: i, px: sx(p.x), py: sy(p.y) }));

    const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => {
      const val = lo + (hi - lo) * (i / Y_TICKS);
      const label = Math.abs(val) >= 1000
        ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`
        : `${Math.round(val)}`;
      return { val, py: sy(val), label };
    });

    return { mapped, yTicks };
  }, [data, IW, IH]);

  const { lineD, areaD } = useMemo(() => {
    const lineD = buildPath(mapped);
    const last  = mapped[mapped.length - 1];
    const first = mapped[0];
    const areaD = `${lineD} L ${last.px},${height - P_B} L ${first.px},${height - P_B} Z`;
    return { lineD, areaD };
  }, [mapped, height]);

  const xTickIndices = useMemo(() => {
    const step = Math.max(1, Math.ceil(data.length / MAX_X_TICKS));
    const set  = new Set(data.map((_, i) => i).filter(i => i % step === 0));
    set.add(data.length - 1);
    return [...set].sort((a, b) => a - b);
  }, [data]);

  // ── Tooltip animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (tooltip) {
      if (!prevTT.current) {
        activeX.value = tooltip.px;
        activeY.value = tooltip.py;
        ttScale.value = 0;
        ttScale.value = withSequence(
          withTiming(1.1, { duration: ANIM.pop }),
          withTiming(1,   { duration: ANIM.settle }),
        );
      } else {
        activeX.value = withTiming(tooltip.px, { duration: ANIM.snap });
        activeY.value = withTiming(tooltip.py, { duration: ANIM.snap });
        ttScale.value = 1;
      }
    } else {
      ttScale.value = withTiming(0, { duration: ANIM.snap });
    }
    prevTT.current = tooltip;
  }, [tooltip]); // eslint-disable-line react-hooks/exhaustive-deps

  const crossProps = useAnimatedProps(() => ({
    x1: activeX.value,
    x2: activeX.value,
    y1: activeY.value,
    y2: height - P_B,
    opacity: ttScale.value,
  }));

  const dotOuterProps = useAnimatedProps(() => ({
    cx: activeX.value,
    cy: activeY.value,
    r:  ttScale.value * DOT_R.active,
    opacity: ttScale.value,
  }));

  const dotInnerProps = useAnimatedProps(() => ({
    cx: activeX.value,
    cy: activeY.value,
    r:  ttScale.value * (DOT_R.active - 3),
    opacity: ttScale.value,
  }));

  const ttStyle = useAnimatedStyle(() => {
    const left = activeX.value - TT_W / 2;
    const top  = Math.max(4, activeY.value - TT_H - 14);
    return {
      left,
      top,
      opacity:   ttScale.value,
      transform: [{ scale: 0.85 + ttScale.value * 0.15 }],
    };
  });

  // ── Touch callbacks ──────────────────────────────────────────────────────
  const mappedRef = useRef(mapped);
  mappedRef.current = mapped;

  const stableTap = useCallback((x) => {
    const pt = closestPoint(mappedRef.current, x);
    if (!pt) return;
    setTooltip(prev => prev?.index === pt.index ? null : pt);
  }, []);

  const stableUpdate = useCallback((x) => {
    const pt = closestPoint(mappedRef.current, x);
    if (pt) setTooltip(prev => prev?.index === pt.index ? prev : pt);
  }, []);

  const stableClear = useCallback(() => setTooltip(null), []);

  const tapGesture = useMemo(() =>
    Gesture.Tap()
      .maxDuration(300)
      .onEnd((e, ok) => {
        'worklet';
        if (ok) {
          runOnJS(stableTap)(e.x);
        }
      }),
    [stableTap]
  );

  const panGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(8)
      .activeOffsetX([-8, 8])
      .failOffsetY([-20, 20])
      .onUpdate((e) => {
        'worklet';
        runOnJS(stableUpdate)(e.x);
      })
      .onEnd(() => {
        'worklet';
        runOnJS(stableClear)();
      }),
    [stableUpdate, stableClear]
  );

  const composed = useMemo(() =>
    Gesture.Exclusive(tapGesture, panGesture),
    [tapGesture, panGesture]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView className="w-full">
      <View className="bg-slate-50 rounded-2xl p-4 w-full shadow-sm">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View className="flex-row justify-between items-center mb-2 px-2">
          {yLabel ? (
            <Text className="text-slate-800 font-sansBold text-l">{yLabel}</Text>
          ) : <View />}
        </View>

        {/* ── Chart area ──────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', height, overflow: 'hidden' }}>

          {/* ── Fixed Y-axis panel ──────────────────────────────────────── */}
          <Svg width={Y_AXIS_W} height={height}>
            <Line
              x1={Y_AXIS_W - 0.75} x2={Y_AXIS_W - 0.75}
              y1={P_T} y2={height - P_B}
              stroke={theme.axis} strokeWidth="1.5"
            />
            {yTicks.map((t, i) => (
              <SvgText
                key={`yl-${i}`}
                x={Y_AXIS_W - 6} y={t.py + 4}
                fill={theme.label} fontSize="10" textAnchor="end"
              >
                {t.label}
              </SvgText>
            ))}
          </Svg>

          {/* ── Plot panel ────────────────────────────────────────────────── */}
          <View style={{ flex: 1, height, position: 'relative', overflow: 'hidden' }}>
            <GestureDetector gesture={composed}>
              <View style={{ width: PLOT_VIEW_W, height, position: 'relative' }}>
                <Svg width={PLOT_VIEW_W} height={height}>
                  <Defs>
                    <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%"   stopColor={theme.primary} stopOpacity="0.22" />
                      <Stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>

                  {/* Horizontal grid lines */}
                  <G>
                    {yTicks.map((t, i) => (
                      <Line
                        key={`gl-${i}`}
                        x1={0} x2={PLOT_VIEW_W} y1={t.py} y2={t.py}
                        stroke={theme.grid} strokeWidth="1" strokeDasharray="4 4"
                      />
                    ))}
                  </G>

                  {/* X-axis line */}
                  <Line
                    x1={0} x2={PLOT_VIEW_W}
                    y1={height - P_B} y2={height - P_B}
                    stroke={theme.axis} strokeWidth="1.5"
                  />

                  {/* Area fill + line */}
                  <Path d={areaD} fill="url(#areaGrad)" />
                  <Path
                    d={lineD} fill="none"
                    stroke={theme.primary} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  />

                  {/* Static dots */}
                  {mapped.map(p => (
                    <GraphDot key={`dot-${p.index}`} p={p} theme={theme} />
                  ))}

                  {/* X-tick labels */}
                  {xTickIndices.map(i => (
                    <SvgText
                      key={`xl-${i}`}
                      x={mapped[i].px} y={height - P_B + 16}
                      fill={theme.label} fontSize="10" textAnchor="middle"
                    >
                      {data[i].x}
                    </SvgText>
                  ))}

                  {/* Animated vertical crosshair */}
                  <AnimatedLine
                    animatedProps={crossProps}
                    stroke={theme.primary} strokeWidth="1.5" strokeDasharray="4 4"
                  />

                  {/* Animated active dot */}
                  <G pointerEvents="none">
                    <AnimatedCircle
                      animatedProps={dotOuterProps}
                      fill={theme.dotFill} stroke={theme.primary} strokeWidth="2.5"
                    />
                    <AnimatedCircle animatedProps={dotInnerProps} fill={theme.primary} />
                  </G>
                </Svg>

                {/* Floating tooltip */}
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: TT_W, height: TT_H,
                      alignItems: 'center', justifyContent: 'center',
                      pointerEvents: 'none',
                    },
                    ttStyle,
                  ]}
                >
                  <View className="bg-slate-50 rounded px-2 py-1 shadow-sm">
                    <Text className="text-slate-600 font-sansBold text-[12px]">
                      ({displayPoint?.x ?? 0}, {currency}{(displayPoint?.y ?? 0).toLocaleString()})
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </GestureDetector>
          </View>
        </View>

        {/* ── X-axis label ────────────────────────────────────────────────── */}
        {xLabel ? (
          <Text
            style={{ marginTop: 5 }}
            className="text-slate-800 font-sansBold text-l text-center"
          >
            {xLabel}
          </Text>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}