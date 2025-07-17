import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

const Card = React.forwardRef<any, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={classnames(styles.card, className)} {...props} />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<any, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={classnames(styles.cardHeader, className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<any, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={classnames(styles.cardTitle, className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  any,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={classnames(styles.cardDescription, className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<any, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={classnames(styles.cardContent, className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<any, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={classnames(styles.cardFooter, className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
