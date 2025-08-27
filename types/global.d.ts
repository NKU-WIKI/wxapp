/// <reference types="@tarojs/taro" />

declare const BASE_URL: string;
declare const APP_NAME: string;

declare module '*.png';
declare module '*.gif';
declare module '*.jpg' {
  const content: any;
  export default content;
}
declare module '*.jpeg';
declare module '*.svg' {
  const content: any;
  export default content;
}
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    /** NODE 内置环境变量, 会影响到最终构建生成产物 */
    NODE_ENV: 'development' | 'production',
    /** 当前构建的平台 */
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'qq' | 'jd' | 'harmony' | 'jdrn'
    /**
     * 当前构建的小程序 appid
     * @description 若不同环境有不同的小程序，可通过在 env 文件中配置环境变量`TARO_APP_ID`来方便快速切换 appid， 而不必手动去修改 dist/project.config.json 文件
     * @see https://taro-docs.jd.com/docs/next/env-mode-config#特殊环境变量-taro_app_id
     */
    TARO_APP_ID: string
    /** 应用基础URL */
    BASE_URL: string
  }
}

// 扩展 wx 全局对象的类型声明
declare namespace wx {
  interface RequestOption {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    data?: string | Record<string, any> | ArrayBuffer;
    header?: Record<string, string>;
    timeout?: number;
    success?: (result: RequestSuccessCallbackResult) => void;
    fail?: (result: any) => void;
    complete?: (result: any) => void;
  }

  interface RequestSuccessCallbackResult {
    data: any;
    statusCode: number;
    header: Record<string, string>;
  }

  function request(option: RequestOption): RequestTask;

  interface RequestTask {
    abort(): void;
  }
}


