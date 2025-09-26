import { Button as TaroButton, View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  // Taro Button specific props
  type?: 'primary' | 'default' | 'warn';
  plain?: boolean;
  disabled?: boolean;
  loading?: boolean;
  formType?: 'submit' | 'reset';
  openType?:
    | 'contact'
    | 'share'
    | 'getPhoneNumber'
    | 'getUserInfo'
    | 'launchApp'
    | 'openSetting'
    | 'feedback';
  hoverClass?: string;
  hoverStopPropagation?: boolean;
  hoverStartTime?: number;
  hoverStayTime?: number;
  lang?: 'en' | 'zh_CN' | 'zh_TW';
  sessionFrom?: string;
  sendMessageTitle?: string;
  sendMessagePath?: string;
  sendMessageImg?: string;
  appParameter?: string;
  showMessageCard?: boolean;
}

const Button = ({
  variant = 'default',
  size = 'default',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) => {
  const buttonClasses = classnames(
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className,
  );

  // Use a View for 'link' variant to avoid button styles, or handle in SCSS
  if (variant === 'link') {
    return (
      <View className={buttonClasses} onClick={onClick} {...props}>
        {children}
      </View>
    );
  }

  return (
    <TaroButton className={buttonClasses} onClick={onClick} {...props}>
      {children}
    </TaroButton>
  );
};

export default Button;
