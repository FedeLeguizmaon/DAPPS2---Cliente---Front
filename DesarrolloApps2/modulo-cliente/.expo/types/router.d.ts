/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/ChangePassword`; params?: Router.UnknownInputParams; } | { pathname: `/Home`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/Login`; params?: Router.UnknownInputParams; } | { pathname: `/Orders`; params?: Router.UnknownInputParams; } | { pathname: `/Profile`; params?: Router.UnknownInputParams; } | { pathname: `/Register`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/ChangePassword`; params?: Router.UnknownOutputParams; } | { pathname: `/Home`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/Login`; params?: Router.UnknownOutputParams; } | { pathname: `/Orders`; params?: Router.UnknownOutputParams; } | { pathname: `/Profile`; params?: Router.UnknownOutputParams; } | { pathname: `/Register`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/ChangePassword${`?${string}` | `#${string}` | ''}` | `/Home${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/Login${`?${string}` | `#${string}` | ''}` | `/Orders${`?${string}` | `#${string}` | ''}` | `/Profile${`?${string}` | `#${string}` | ''}` | `/Register${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/ChangePassword`; params?: Router.UnknownInputParams; } | { pathname: `/Home`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/Login`; params?: Router.UnknownInputParams; } | { pathname: `/Orders`; params?: Router.UnknownInputParams; } | { pathname: `/Profile`; params?: Router.UnknownInputParams; } | { pathname: `/Register`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
