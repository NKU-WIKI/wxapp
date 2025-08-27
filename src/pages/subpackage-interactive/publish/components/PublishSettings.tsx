import { View, Text, Image } from "@tarojs/components";
import classnames from "classnames";
import styles from "./PublishSettings.module.scss";

import globeIcon from "@/assets/globe.svg";
import messageCircleIcon from "@/assets/message-circle.svg";
import robotIcon from "@/assets/robot.svg";

interface PublishSettingsProps {
  isPublic: boolean;
  onPublicChange: (value: boolean) => void;
  allowComments: boolean;
  onAllowCommentsChange: (value: boolean) => void;
}

const PublishSettings = (props: PublishSettingsProps) => {
  const {
    isPublic,
    onPublicChange,
    allowComments,
    onAllowCommentsChange,
  } = props;

  return (
    <View className={styles.settingsCard}>
      <View
        className={classnames(styles.settingItem, {
          [styles.active]: isPublic,
        })}
        onClick={() => onPublicChange(!isPublic)}
      >
        <Image src={globeIcon} className={styles.icon} />
        <Text className={styles.label}>公开</Text>
      </View>
      <View
        className={classnames(styles.settingItem, {
          [styles.active]: allowComments,
        })}
        onClick={() => onAllowCommentsChange(!allowComments)}
      >
        <Image src={messageCircleIcon} className={styles.icon} />
        <Text className={styles.label}>允许评论</Text>
      </View>
    </View>
  );
};

export default PublishSettings;
