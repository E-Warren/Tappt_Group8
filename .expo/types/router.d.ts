/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/about`; params?: Router.UnknownInputParams; } | { pathname: `/createdecks`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/rules`; params?: Router.UnknownInputParams; } | { pathname: `/signUp`; params?: Router.UnknownInputParams; } | { pathname: `/slogin`; params?: Router.UnknownInputParams; } | { pathname: `/studentWaiting`; params?: Router.UnknownInputParams; } | { pathname: `/teacherwaiting`; params?: Router.UnknownInputParams; } | { pathname: `/useWebSocketStore`; params?: Router.UnknownInputParams; } | { pathname: `/view-decks`; params?: Router.UnknownInputParams; } | { pathname: `/webSocketService`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } } | { pathname: `/createdecks/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/about`; params?: Router.UnknownOutputParams; } | { pathname: `/createdecks`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/rules`; params?: Router.UnknownOutputParams; } | { pathname: `/signUp`; params?: Router.UnknownOutputParams; } | { pathname: `/slogin`; params?: Router.UnknownOutputParams; } | { pathname: `/studentWaiting`; params?: Router.UnknownOutputParams; } | { pathname: `/teacherwaiting`; params?: Router.UnknownOutputParams; } | { pathname: `/useWebSocketStore`; params?: Router.UnknownOutputParams; } | { pathname: `/view-decks`; params?: Router.UnknownOutputParams; } | { pathname: `/webSocketService`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } } | { pathname: `/createdecks/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/about${`?${string}` | `#${string}` | ''}` | `/createdecks${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/rules${`?${string}` | `#${string}` | ''}` | `/signUp${`?${string}` | `#${string}` | ''}` | `/slogin${`?${string}` | `#${string}` | ''}` | `/studentWaiting${`?${string}` | `#${string}` | ''}` | `/teacherwaiting${`?${string}` | `#${string}` | ''}` | `/useWebSocketStore${`?${string}` | `#${string}` | ''}` | `/view-decks${`?${string}` | `#${string}` | ''}` | `/webSocketService${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/about`; params?: Router.UnknownInputParams; } | { pathname: `/createdecks`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/rules`; params?: Router.UnknownInputParams; } | { pathname: `/signUp`; params?: Router.UnknownInputParams; } | { pathname: `/slogin`; params?: Router.UnknownInputParams; } | { pathname: `/studentWaiting`; params?: Router.UnknownInputParams; } | { pathname: `/teacherwaiting`; params?: Router.UnknownInputParams; } | { pathname: `/useWebSocketStore`; params?: Router.UnknownInputParams; } | { pathname: `/view-decks`; params?: Router.UnknownInputParams; } | { pathname: `/webSocketService`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | `/+not-found` | `/createdecks/${Router.SingleRoutePart<T>}` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } } | { pathname: `/createdecks/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
