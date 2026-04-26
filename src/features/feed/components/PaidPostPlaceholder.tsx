import { BlurView } from 'expo-blur';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../../../shared/theme/theme';

const DONATE_PURPLE = theme.colors.paidDonatePrimary;

const BLUR_INTENSITY = Platform.select({ ios: 20, android: 32, default: 24 }) ?? 24;

type PaidPostLockedCoverProps = {
  coverUrl: string;
  imageKey: string;
};

/** Blurred/dimmed cover + centered lock UI — Figma node 1:4476 */
export const PaidPostLockedCover = ({ coverUrl, imageKey }: PaidPostLockedCoverProps) => {
  return (
    <View style={styles.coverRoot} collapsable={false}>
      <Image
        key={imageKey}
        source={{ uri: coverUrl }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      {Platform.OS === 'web' ? (
        <View style={[styles.blurFallback, StyleSheet.absoluteFillObject]} />
      ) : (
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="dark"
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <View style={[styles.dimLayer, StyleSheet.absoluteFillObject]} />
      <View style={styles.overlayContent} pointerEvents="box-none">
        <View style={styles.paidMessage}>
          <View style={styles.topContent}>
            <View style={styles.textIcon}>
              <View style={styles.donateIconOuter}>
                <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                  <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM10.0003 4C10.2774 4 10.5004 4.25078 10.5004 4.5625H10.5025V5.72031C11.0714 5.78594 11.6027 5.91016 11.9924 6.01328C12.2612 6.08594 12.4279 6.38828 12.3633 6.69063C12.2987 6.99297 12.0299 7.18047 11.7611 7.10781C11.1193 6.93906 10.1857 6.74219 9.38761 6.81484C8.99168 6.85 8.67077 6.95078 8.44363 7.1125C8.23316 7.2625 8.08312 7.47813 8.02269 7.825C7.97685 8.09922 8.0081 8.275 8.06437 8.39922C8.12272 8.53281 8.23316 8.66406 8.42071 8.79531C8.81872 9.07422 9.41679 9.25 10.1232 9.45156L10.1711 9.46562C10.8171 9.65078 11.5611 9.86406 12.107 10.2437C12.3967 10.4453 12.6655 10.7172 12.8322 11.0922C13.001 11.4766 13.0406 11.9102 12.9593 12.3859C12.8176 13.2156 12.28 13.757 11.6152 14.0406C11.2797 14.1836 10.9026 14.268 10.5004 14.2984V15.4375C10.5004 15.7492 10.2774 16 10.0003 16C9.72311 16 9.50014 15.7492 9.50014 15.4375V14.2703C9.43137 14.2633 9.36261 14.2539 9.29384 14.2422H9.29175C8.77288 14.1578 7.8539 13.9187 7.29751 13.6422C7.04537 13.5156 6.93076 13.1828 7.04328 12.8992C7.15581 12.6156 7.45172 12.4867 7.70386 12.6133C8.14564 12.8336 8.96251 13.0539 9.43346 13.1313C10.1753 13.2484 10.8088 13.1852 11.2589 12.993C11.6986 12.8055 11.9174 12.5195 11.9778 12.175C12.0237 11.9008 11.9924 11.725 11.9362 11.6008C11.8778 11.4672 11.7674 11.3359 11.5798 11.2047C11.1818 10.9258 10.5837 10.75 9.87732 10.5484L9.82939 10.5344C9.18339 10.3492 8.43946 10.1359 7.89349 9.75625C7.60384 9.55469 7.33502 9.28281 7.16831 8.90781C6.99952 8.52344 6.95993 8.08984 7.0412 7.61406C7.15581 6.95312 7.47256 6.475 7.906 6.16563C8.32277 5.86797 8.82289 5.73906 9.30634 5.69453C9.37094 5.6875 9.43554 5.68281 9.50014 5.68047V4.5625C9.50014 4.25078 9.72311 4 10.0003 4Z"
                    fill="#FFFFFF"
                  />
                </Svg>
              </View>
              <View style={styles.overlayTextBlock}>
                <Text style={styles.overlayLine}>Контент скрыт пользователем.</Text>
                <Text style={styles.overlayLine}>Доступ откроется после доната</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.donateButton, pressed && styles.donateButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Отправить донат"
          >
            <Text style={styles.donateButtonLabel}>Отправить донат</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

/** Grey skeleton lines under cover — Figma node 1:4494 */
export const PaidPostLockedSkeleton = () => (
  <View style={styles.skeletonStack}>
    <View style={styles.skeletonLineShort} />
    <View style={styles.skeletonLineFull} />
  </View>
);

const styles = StyleSheet.create({
  coverRoot: {
    width: '100%',
    aspectRatio: theme.layout.postCoverMediaAspectRatio,
    backgroundColor: theme.colors.imagePlaceholder,
    overflow: 'hidden',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  blurFallback: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dimLayer: {
    backgroundColor: theme.colors.paidLockedOverlayDim,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidMessage: {
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  topContent: {
    padding: 12,
    alignItems: 'center',
  },
  textIcon: {
    alignItems: 'center',
    gap: 8,
  },
  donateIconOuter: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: DONATE_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTextBlock: {
    alignItems: 'center',
  },
  overlayLine: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
  donateButton: {
    height: 42,
    width: 239,
    maxWidth: '100%',
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: DONATE_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donateButtonPressed: {
    opacity: 0.92,
  },
  donateButtonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 26,
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
  /** Figma: 8px gap under image + 8px pt in label block */
  skeletonStack: {
    width: '100%',
    marginTop: 8,
    paddingTop: 8,
    gap: 8,
    alignItems: 'flex-start',
  },
  skeletonLineShort: {
    height: 26,
    width: 164,
    maxWidth: '100%',
    borderRadius: 22,
    backgroundColor: theme.colors.paidLockedSkeleton,
  },
  skeletonLineFull: {
    height: 40,
    width: '100%',
    borderRadius: 22,
    backgroundColor: theme.colors.paidLockedSkeleton,
  },
});
