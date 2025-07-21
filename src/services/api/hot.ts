import http from '../request';

export interface HotPage {
  page_size: number;
}

export const hotApi = {
  getHotPage: () => {
    return http.get<HotPage>('/knowledge/hot/page')
  }
}
